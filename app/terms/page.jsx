export const metadata = { title: "شروط الاستخدام | متجر بطاطا" };

export default function TermsPage() {
  return (
    <div dir="rtl" style={{ background: "#000", color: "#F5F5F5", minHeight: "100vh", fontFamily: "'Tajawal', sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/" style={{ color: "#F5F5F5", fontSize: 13, opacity: 0.7, textDecoration: "underline" }}>← الرجوع لمتجر بطاطا</a>
        <h1 style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif", fontSize: 28, fontWeight: 800, margin: "20px 0 24px" }}>شروط الاستخدام</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15, lineHeight: 1.9, opacity: 0.85 }}>
          <p>مرحبًا بك في متجر بطاطا. باستخدامك لهذا الموقع فإنك توافق على الشروط التالية:</p>
          <p><b style={{ color: "#fff" }}>1. طبيعة المتجر:</b> متجر بطاطا متجر مستقل غير تابع رسميًا لشركة Roblox Corporation أو أي شركة ألعاب أخرى. جميع الأسماء والعلامات التجارية المذكورة ملك لأصحابها وتُستخدم للتعريف فقط.</p>
          <p><b style={{ color: "#fff" }}>2. المنتجات:</b> نبيع عناصر وحسابات وخدمات رقمية داخل الألعاب. التسليم يتم إلكترونيًا حسب الطريقة الموضحة بكل منتج.</p>
          <p><b style={{ color: "#fff" }}>3. مسؤولية المستخدم:</b> يجب أن تكون بياناتك (معرف اللعبة أو البريد الإلكتروني) صحيحة عند الطلب، ونحن غير مسؤولين عن أي خطأ ناتج عن بيانات غير صحيحة أدخلها المستخدم.</p>
          <p><b style={{ color: "#fff" }}>4. الأسعار:</b> جميع الأسعار معروضة بالريال السعودي وقابلة للتغيير دون إشعار مسبق.</p>
          <p><b style={{ color: "#fff" }}>5. الاستخدام المقبول:</b> يُمنع استخدام الموقع لأي غرض غير قانوني أو محاولة الإضرار به.</p>
          <p>لأي استفسار حول هذه الشروط، تواصل معنا على 2aymanm.asd@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
