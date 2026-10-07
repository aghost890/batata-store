// Supabase Edge Function: deliver-stock-account (آمنة ضد التكرار + تعيد المحاولة + تنبّه الأدمن لو فشل الإيميل)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// بعد توثيق دومين بـ Resend: أضف Secret باسم FROM_EMAIL مثل: متجر بطاطا <orders@yourdomain.com>
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "متجر بطاطا <onboarding@resend.dev>";
const ADMIN_ALERT_EMAIL = "b23334758@gmail.com";

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  let data: unknown = null;
  try { data = await res.json(); } catch (_) {}
  return { ok: res.ok, data };
}

// يرجّع إيميل المستخدم المسجّل دخوله، أو null
async function getUserEmail(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data } = await userClient.auth.getUser();
  return data?.user?.email ?? null;
}

async function isAdminEmail(email: string | null): Promise<boolean> {
  if (!email) return false;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data } = await admin.from("admin_users").select("email").eq("email", email).maybeSingle();
  return !!data;
}

const LOW_STOCK_THRESHOLD = 2;

async function sendAdminAlert(subject: string, html: string) {
  try { await sendEmail(ADMIN_ALERT_EMAIL, subject, html); } catch (_) {}
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { orderId } = await req.json();
    if (!orderId) return json({ error: "orderId مفقود" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!order) return json({ error: "الطلب غير موجود" }, 404);
    if (!order.email) return json({ error: "لا يوجد بريد إلكتروني لهذا الطلب" }, 400);

    // ما نسلّم مرتين
    if (order.status === "مكتمل" || order.status === "تم التسليم") {
      return json({ success: false, reason: "already_delivered" });
    }
    // نسلّم فقط طلب مدفوع (PayPal) أو طلب حوّله الأدمن لـ "جاري التجهيز"
    const paid = String(order.payment_ref || "").includes("PayPal مؤكد");
    if (!paid && order.status !== "جاري التجهيز") return json({ success: false, reason: "not_paid" }, 403);

    const items: any[] = order.items || [];
    const nameOf = (pid: unknown) =>
      items.find((i) => String(i.productId) === String(pid))?.product?.name || String(pid);

    let accounts: { productName: string; username: string; password: string; account_email?: string }[] = [];
    const lowStockAlerts: { productName: string; remaining: number }[] = [];

    // لو الطلب عنده حسابات معيّنة من محاولة سابقة (فشل الإيميل)، نعيد إرسالها بدل ما نسحب حسابات جديدة
    const { data: existing } = await supabase.from("account_stock").select("*").eq("assigned_order_id", orderId);
    if (existing && existing.length > 0) {
      accounts = existing.map((r: any) => ({ productName: nameOf(r.product_id), username: r.username, password: r.password, account_email: r.account_email }));
    } else {
      // تحقق مسبق: المخزون كافٍ لكل المنتجات؟
      for (const item of items) {
        const qty = item.qty || 1;
        const { data: available, error: availErr } = await supabase
          .from("account_stock").select("id").eq("product_id", item.productId).eq("status", "available").limit(qty);
        if (availErr || !available || available.length < qty) {
          await sendAdminAlert(
            `🚨 نفاد المخزون - ${nameOf(item.productId)}`,
            `<div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">
              <h2>🚨 تنبيه: مخزون غير كافٍ</h2>
              <p>الطلب <b>#${esc(orderId)}</b> (${esc(order.email)}) يحتاج <b>${esc(qty)}</b> حساب من "<b>${esc(nameOf(item.productId))}</b>"، لكن المتوفر أقل.</p>
              <p>الطلب لم يُسلَّم تلقائيًا، يحتاج تدخّلك بعد ما تضيف مخزون.</p>
            </div>`
          );
          return json({ success: false, reason: "insufficient_stock", productId: item.productId });
        }
      }

      for (const item of items) {
        const qty = item.qty || 1;
        const { data: rows } = await supabase
          .from("account_stock").select("*").eq("product_id", item.productId).eq("status", "available")
          .order("created_at", { ascending: true }).limit(qty);
        if (!rows || rows.length < qty) continue;

        for (const row of rows) {
          const { error: updateErr } = await supabase
            .from("account_stock")
            .update({ status: "assigned", assigned_order_id: orderId, assigned_at: new Date().toISOString() })
            .eq("id", row.id).eq("status", "available");
          if (!updateErr) {
            accounts.push({ productName: nameOf(item.productId), username: row.username, password: row.password, account_email: row.account_email });
          }
        }

        const { count: remaining } = await supabase
          .from("account_stock").select("id", { count: "exact", head: true })
          .eq("product_id", item.productId).eq("status", "available");
        if (typeof remaining === "number" && remaining <= LOW_STOCK_THRESHOLD) {
          lowStockAlerts.push({ productName: nameOf(item.productId), remaining });
        }
      }
    }

    if (accounts.length === 0) return json({ success: false, reason: "no_accounts_assigned" });

    const accountsHtml = accounts.map((a) => `
      <div style="border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:10px;">
        <div style="font-weight:bold;margin-bottom:6px;">${esc(a.productName)}</div>
        <div>اسم المستخدم: <b>${esc(a.username)}</b></div>
        <div>كلمة المرور: <b>${esc(a.password)}</b></div>
        ${a.account_email ? `<div>الإيميل المرتبط: <b>${esc(a.account_email)}</b></div>` : ""}
      </div>`).join("");

    const html = `
      <div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;max-width:480px;margin:auto;">
        <h2>🥔 حسابك جاهز - متجر بطاطا</h2>
        <p>شكرًا لطلبك #${esc(orderId)}! تفضل بيانات حسابك:</p>
        ${accountsHtml}
        <hr/>
        <p style="color:#666;font-size:13px;">لو واجهت أي مشكلة بالدخول، تواصل معنا عبر ديسكورد الدعم الفني وأرفق رقم طلبك.</p>
      </div>`;

    const sent = await sendEmail(order.email, `🥔 حسابك جاهز - طلب #${orderId}`, html);
    if (!sent.ok) {
      // الحسابات تبقى محجوزة لهذا الطلب، والأدمن يستلم التفاصيل ليسلّمها يدويًا، أو يعيد المحاولة لاحقًا
      await sendAdminAlert(
        `⚠️ فشل إرسال حساب للعميل - طلب #${orderId}`,
        `<div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">
          <h2>⚠️ فشل إرسال الإيميل للعميل</h2>
          <p>الطلب <b>#${esc(orderId)}</b>، إيميل العميل: <b>${esc(order.email)}</b></p>
          <p>سلّمه الحساب يدويًا (واتساب/ديسكورد) من البيانات التالية:</p>
          ${accountsHtml}
          <p style="color:#666;font-size:13px;">السبب غالبًا: Resend ما يسمح بالإرسال لإيميلات الزبائن قبل توثيق دومين.</p>
        </div>`
      );
      return json({ success: false, reason: "email_failed", detail: sent.data }, 500);
    }

    await supabase.from("orders").update({ status: "مكتمل" }).eq("id", orderId);

    if (lowStockAlerts.length > 0) {
      const list = lowStockAlerts.map((a) => `<li><b>${esc(a.productName)}</b>: تبقّى <b>${esc(a.remaining)}</b> حساب فقط</li>`).join("");
      await sendAdminAlert(
        `⚠️ مخزون منخفض - ${lowStockAlerts.length} منتج`,
        `<div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;">
          <h2>⚠️ تنبيه: مخزون منخفض</h2><p>المنتجات التالية اقترب مخزونها من النفاد:</p><ul>${list}</ul></div>`
      );
    }

    return json({ success: true, delivered: accounts.length });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
