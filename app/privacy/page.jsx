export const metadata = { title: "سياسة الخصوصية | متجر بطاطا" };

export default function PrivacyPage() {
  return (
    <div dir="rtl" style={{ background: "#000", color: "#F5F5F5", minHeight: "100vh", fontFamily: "'Tajawal', sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/" style={{ color: "#F5F5F5", fontSize: 13, opacity: 0.7, textDecoration: "underline" }}>← الرجوع لمتجر بطاطا</a>
        <h1 style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif", fontSize: 28, fontWeight: 800, margin: "20px 0 24px" }}>سياسة الخصوصية</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15, lineHeight: 1.9, opacity: 0.85 }}>
          <p>نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
          <p><b style={{ color: "#fff" }}>البيانات التي نجمعها:</b> معرف حسابك باللعبة و/أو بريدك الإلكتروني عند إتمام طلب، فقط لغرض تسليم المنتج والتواصل معك بخصوص طلبك.</p>
          <p><b style={{ color: "#fff" }}>كيف نستخدم بياناتك:</b> نستخدمها فقط لتنفيذ طلبك وإرسال بيانات المنتج (مثل بيانات حساب) وتقديم الدعم الفني.</p>
          <p><b style={{ color: "#fff" }}>مشاركة البيانات:</b> لا نبيع أو نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية. قد نشارك بيانات الدفع الضرورية فقط مع بوابة الدفع المستخدمة لإتمام العملية.</p>
          <p><b style={{ color: "#fff" }}>حماية البيانات:</b> بياناتك مخزّنة على خوادم آمنة (Supabase) مع سياسات وصول محدودة.</p>
          <p>لأي استفسار حول بياناتك، تواصل معنا على 2aymanm.asd@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
