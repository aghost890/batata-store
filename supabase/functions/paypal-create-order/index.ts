// Supabase Edge Function: paypal-create-order (السعر يُحسب بالسيرفر)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// عدّلها لو كنت تستخدم sandbox: https://api-m.sandbox.paypal.com
const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_BASE") || "https://api-m.paypal.com";
const BHD_TO_USD = 2.65957;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

async function getAccessToken(): Promise<string> {
  const id = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(`${id}:${secret}`), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error("paypal auth failed");
  return data.access_token;
}

// السعر يُحسب من قاعدة البيانات فقط، ولا يُؤخذ أي سعر من المتصفح
async function priceOrder(supabase: any, rawItems: any, couponCode: any, checkUsage: boolean) {
  if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20) throw new Error("سلة غير صالحة");
  const qtyById = new Map<string, number>();
  for (const it of rawItems) {
    const pid = String(it?.productId ?? "");
    const qty = Number(it?.qty);
    if (!pid || !Number.isInteger(qty) || qty < 1 || qty > 20) throw new Error("سلة غير صالحة");
    qtyById.set(pid, (qtyById.get(pid) || 0) + qty);
  }
  const ids = [...qtyById.keys()];
  const { data: rows, error } = await supabase.from("products").select("*").in("id", ids);
  if (error || !rows || rows.length !== ids.length) throw new Error("منتج غير موجود");

  let subtotal = 0;
  const items: any[] = [];
  for (const r of rows) {
    if (r.stock != null && Number(r.stock) <= 0) throw new Error("نفد المخزون: " + r.name);
    const qty = qtyById.get(String(r.id)) as number;
    const price = Number(r.price);
    subtotal += price * qty;
    items.push({
      productId: r.id,
      qty,
      product: {
        id: r.id, name: r.name, category: r.category, map: r.map, price, oldPrice: r.old_price,
        stock: r.stock, emoji: r.emoji, image: r.image, description: r.description,
        delivery: r.delivery, featured: r.featured,
      },
    });
  }
  subtotal = round3(subtotal);

  let percent = 0;
  let code: string | null = null;
  if (couponCode) {
    const { data: c } = await supabase.from("coupons").select("*").eq("code", String(couponCode).trim().toUpperCase()).maybeSingle();
    const ok = c && c.active &&
      (!c.expires_at || new Date(c.expires_at) > new Date()) &&
      (!checkUsage || c.max_uses == null || c.used_count < c.max_uses);
    if (!ok) throw new Error("الكوبون غير صالح");
    percent = Number(c.percent);
    code = c.code;
  }
  const discount = round3((subtotal * percent) / 100);
  const totalBHD = Math.max(0, round3(subtotal - discount));
  const usd = (Math.round(totalBHD * BHD_TO_USD * 100) / 100).toFixed(2);
  if (Number(usd) < 0.01) throw new Error("مبلغ غير صالح");
  return { items, subtotal, discount, totalBHD, usd, couponCode: code };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { items, coupon } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    let priced;
    try {
      priced = await priceOrder(supabase, items, coupon, true);
    } catch (e) {
      return json({ error: String((e as Error).message || e) }, 400);
    }

    const accessToken = await getAccessToken();
    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ description: "Batata Store order", amount: { currency_code: "USD", value: priced.usd } }],
      }),
    });
    const data = await res.json();
    if (!res.ok) return json({ error: "paypal create failed" }, 500);
    return json({ id: data.id });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
