// Supabase Edge Function: delete-account (المستخدم يحذف حسابه هو فقط)
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data } = await userClient.auth.getUser();
    const user = data?.user;
    if (!user) return json({ error: "غير مصرّح" }, 401);

    // حماية: ما نحذف حسابات الأدمن من هنا
    if (await isAdminEmail(user.email ?? null)) return json({ error: "لا يمكن حذف حساب أدمن من هنا" }, 403);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return json({ error: error.message }, 500);
    return json({ success: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
