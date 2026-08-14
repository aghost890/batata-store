"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ShopPricingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("*").order("price", { ascending: true });
      if (data) setProducts(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div dir="rtl" style={{ background: "#000", color: "#F5F5F5", minHeight: "100vh", fontFamily: "'Tajawal', sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <a href="/" style={{ color: "#F5F5F5", fontSize: 13, opacity: 0.7, textDecoration: "underline" }}>← الرجوع لمتجر بطاطا</a>
        <h1 style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif", fontSize: 28, fontWeight: 800, margin: "20px 0 24px" }}>الأسعار</h1>
        {loading && <p style={{ opacity: 0.6, fontSize: 14 }}>جاري التحميل...</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141414", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "14px 16px" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.emoji} {p.name}</div>
                <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{p.map}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{p.price} ﷼</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
