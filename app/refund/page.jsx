import { SUPPORT_EMAIL } from "../../lib/site";

export const metadata = { title: "سياسة الاسترجاع | متجر بطاطا" };

export default function RefundPage() {
  return (
    <div dir="rtl" style={{ background: "#15100C", color: "#F7F1E6", minHeight: "100vh", fontFamily: "'Tajawal', sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/" style={{ color: "#EFA53C", fontSize: 13, textDecoration: "underline" }}>← الرجوع لمتجر بطاطا</a>
        <h1 style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif", fontSize: 28, fontWeight: 800, margin: "20px 0 24px" }}>سياسة الاسترجاع</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15, lineHeight: 1.9, opacity: 0.85 }}>
          <p>نظرًا لطبيعة المنتجات الرقمية، تُطبّق سياسة الاسترجاع التالية:</p>
          <p><b style={{ color: "#F5C874" }}>1. الحسابات المُسلَّمة:</b> بما أن الحسابات تُسلَّم إلكترونيًا فور الدفع، لا يمكن استرجاعها بعد التسليم الناجح إلا في حالات الخطأ من طرفنا.</p>
          <p><b style={{ color: "#F5C874" }}>2. حالات الاسترجاع المقبولة:</b></p>
          <ul style={{ paddingRight: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>عدم تسليم المنتج خلال المدة المعلنة</li>
            <li>تسليم منتج مختلف عمّا تم طلبه</li>
            <li>مشكلة تقنية أدت لعدم استلام بيانات الحساب</li>
          </ul>
          <p><b style={{ color: "#F5C874" }}>3. آلية الاسترجاع:</b> تواصل معنا خلال 48 ساعة من الطلب على {SUPPORT_EMAIL} مع ذكر رقم الطلب، وسنراجع الحالة ونرد خلال 3 أيام عمل.</p>
          <p><b style={{ color: "#F5C874" }}>4. طريقة الاسترجاع:</b> يتم الاسترجاع بنفس وسيلة الدفع الأصلية خلال مدة تعتمد على بوابة الدفع المستخدمة.</p>
        </div>
      </div>
    </div>
  );
}
