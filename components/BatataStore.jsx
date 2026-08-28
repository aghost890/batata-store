"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ShoppingCart, Search, Star, Menu, X, LogIn, Plus, Minus, Trash2,
  Package, Settings, ChevronLeft, ChevronRight, Home as HomeIcon,
  Store, Tag, HelpCircle, Phone, Instagram, MessageCircle, Clock,
  Shield, Zap, Headphones, TrendingUp, Sparkles, Edit3, Check, LayoutGrid,
  Sun, Moon
} from "lucide-react";

/* ============================= theme tokens ============================= */
const THEMES = {
  dark: {
    "--bg": "#000000", "--bg-90": "rgba(0,0,0,.92)",
    "--surface": "#141414", "--surface2": "#1D1D1D",
    "--text": "#FFFFFF", "--text-dim": "#B5B5B5", "--text-dim2": "#8A8A8A", "--text-dim3": "#6B6B6B",
    "--soft-bg": "rgba(255,255,255,.08)", "--soft-border": "rgba(255,255,255,.20)",
    "--line": "rgba(255,255,255,.08)", "--line-strong": "rgba(255,255,255,.16)",
    "--fill": "rgba(255,255,255,.06)", "--fill-strong": "rgba(255,255,255,.13)",
  },
  light: {
    "--bg": "#FFFFFF", "--bg-90": "rgba(255,255,255,.92)",
    "--surface": "#F3F3F3", "--surface2": "#EAEAEA",
    "--text": "#000000", "--text-dim": "#4B4B4B", "--text-dim2": "#6E6E6E", "--text-dim3": "#8C8C8C",
    "--soft-bg": "rgba(0,0,0,.05)", "--soft-border": "rgba(0,0,0,.16)",
    "--line": "rgba(0,0,0,.09)", "--line-strong": "rgba(0,0,0,.16)",
    "--fill": "rgba(0,0,0,.045)", "--fill-strong": "rgba(0,0,0,.08)",
  },
};

/* ============================= design tokens =============================
  نظام أبيض/أسود بالكامل عبر متغيرات CSS (--bg, --surface, --text ...)
  يتغيّر تلقائياً حسب وضع الثيم (داكن / فاتح) بزر التبديل في الهيدر.
============================================================================ */

const SEED_CATEGORIES = [
  { id: "starter", label: "حسابات مبتدئين", sub: "Starter Accounts", emoji: "🥔" },
  { id: "premium", label: "حسابات مميزة", sub: "Premium Accounts", emoji: "⭐" },
  { id: "vip", label: "حسابات VIP", sub: "VIP Accounts", emoji: "👑" },
  { id: "elite", label: "حسابات النخبة", sub: "Elite Accounts", emoji: "🏆" },
  { id: "offers", label: "العروض", sub: "Hot Deals", emoji: "🔥" },
];

const MAPS = ["الكل", "موثق بالبريد", "موثق بالهاتف", "موثق بالكامل", "غير موثق"];

const SEED_PRODUCTS = [
  { id: "p1", name: "حساب النخبة الأسطوري", category: "elite", map: "موثق بالكامل", price: 65, oldPrice: 90, stock: 4, rating: 4.8, reviews: 132, emoji: "🔱", featured: true,
    description: "أعلى مستوياتنا من حيث المواصفات والتوثيق الكامل، تسليم فوري بعد الدفع.", delivery: "خلال 10 دقائق" },
  { id: "p2", name: "حساب مميز Premium", category: "premium", map: "موثق بالبريد", price: 22, oldPrice: null, stock: 12, rating: 4.9, reviews: 340, emoji: "⭐", featured: true,
    description: "حساب بمستوى متوسط إلى عالي ومواصفات مرتبة، تسليم مباشر وآمن.", delivery: "خلال 15 دقيقة" },
  { id: "p3", name: "حساب مبتدئ بلس", category: "starter", map: "موثق بالبريد", price: 18, oldPrice: 25, stock: 9, rating: 4.7, reviews: 210, emoji: "🌱", featured: false,
    description: "حساب مبتدئ بمزايا إضافية ومظهر مرتب، تسليم مباشر بعد إتمام الطلب.", delivery: "خلال 15 دقيقة" },
  { id: "p4", name: "حساب مبتدئ اقتصادي", category: "starter", map: "غير موثق", price: 12, oldPrice: null, stock: 20, rating: 4.6, reviews: 98, emoji: "🌟", featured: true,
    description: "أرخص خيار عندنا للبداية، جودة جيدة وسعر مناسب للجميع.", delivery: "خلال 20 دقيقة" },
  { id: "p5", name: "حساب مميز نادر التوفر", category: "premium", map: "موثق بالهاتف", price: 30, oldPrice: 40, stock: 6, rating: 4.5, reviews: 74, emoji: "✨", featured: false,
    description: "حساب مميز بكمية محدودة، مناسب لمن يبحث عن شيء مختلف.", delivery: "خلال 30 دقيقة" },
  { id: "p6", name: "باقة VIP مميزة", category: "vip", map: "موثق بالبريد", price: 45, oldPrice: 60, stock: 3, rating: 4.9, reviews: 51, emoji: "💎", featured: true,
    description: "باقة VIP تجمع مواصفات ممتازة بسعر تنافسي.", delivery: "خلال 30 دقيقة" },
  { id: "p7", name: "حساب VIP متكامل", category: "vip", map: "موثق بالهاتف", price: 40, oldPrice: null, stock: 50, rating: 4.8, reviews: 500, emoji: "👑", featured: false,
    description: "حساب VIP بتوثيق كامل ومظهر احترافي، الأكثر طلبًا لدينا.", delivery: "خلال 5 دقائق" },
  { id: "p8", name: "حساب مبتدئ أساسي", category: "starter", map: "غير موثق", price: 15, oldPrice: 20, stock: 15, rating: 4.3, reviews: 40, emoji: "🥔", featured: false,
    description: "حساب بسيط ومناسب لأول تجربة لك، تسليم سريع وآمن بعد الدفع مباشرة.", delivery: "خلال 10 دقائق" },
  { id: "p9", name: "حساب VIP نادر", category: "vip", map: "موثق بالبريد", price: 35, oldPrice: null, stock: 5, rating: 5.0, reviews: 180, emoji: "🔷", featured: true,
    description: "من أفضل حسابات VIP المتوفرة حاليًا، كمية محدودة جدًا.", delivery: "خلال 15 دقيقة" },
  { id: "p10", name: "باقة حسابات مميزة", category: "premium", map: "موثق بالبريد", price: 25, oldPrice: 32, stock: 7, rating: 4.7, reviews: 120, emoji: "📦", featured: false,
    description: "باقة تجمع أكثر من حساب مميز بسعر أفضل من الشراء المنفرد.", delivery: "خلال 20 دقيقة" },
  { id: "p11", name: "حساب النخبة الأساسي", category: "elite", map: "موثق بالبريد", price: 20, oldPrice: null, stock: 30, rating: 4.4, reviews: 65, emoji: "🏆", featured: false,
    description: "حساب من فئة النخبة بمواصفات متكاملة ومظهر مميز.", delivery: "خلال ساعة" },
  { id: "p12", name: "حساب النخبة الذهبي", category: "elite", map: "موثق بالهاتف", price: 55, oldPrice: 70, stock: 2, rating: 4.9, reviews: 33, emoji: "🥇", featured: false,
    description: "حساب ذهبي من فئة النخبة، الكمية محدودة جدًا فلا تتأخر.", delivery: "خلال 20 دقيقة" },
];

const STATUS_STYLES = {
  "قيد المراجعة": "c-soft-bg c-text-dim2 c-border-soft",
  "جاري التجهيز": "c-soft-bg c-text-dim c-border-line-strong",
  "تم التسليم": "c-fill-strong c-text c-border-soft",
  "مكتمل": "c-bg-text c-text-bg c-border-text",
  "ملغي": "bg-transparent c-text-dim3 c-border-line-strong line-through",
};
const STATUS_LIST = ["قيد المراجعة", "جاري التجهيز", "تم التسليم", "مكتمل", "ملغي"];

/* ============================= storage helpers ============================= */
// NOTE: real deployment uses the browser's localStorage instead of the
// Claude-artifact-only window.storage API. This persists data per-browser/device.
// For a catalog that's truly shared across every visitor (e.g. products an admin
// adds show up for all customers), swap this for a real backend (Supabase,
// Firebase, or a small API route + database).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---- تحويل بين snake_case (قاعدة البيانات) و camelCase (التطبيق) ----
function dbToProduct(p) {
  return { id: p.id, name: p.name, category: p.category, map: p.map, price: Number(p.price), oldPrice: p.old_price != null ? Number(p.old_price) : null, stock: p.stock, rating: Number(p.rating), reviews: p.reviews, emoji: p.emoji, image: p.image, featured: p.featured, description: p.description, delivery: p.delivery };
}
function productToDb(p) {
  return { id: p.id, name: p.name, category: p.category, map: p.map, price: p.price, old_price: p.oldPrice ?? null, stock: p.stock, emoji: p.emoji, image: p.image || null, description: p.description, delivery: p.delivery, featured: !!p.featured };
}
function dbToOrder(o) {
  return { id: o.id, items: o.items, total: Number(o.total), gameId: o.game_id, email: o.email, status: o.status, date: new Date(o.created_at).getTime() };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================= small UI atoms ============================= */
function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-1 c-fs-11 font-bold px-2.5 py-1 rounded-md border ${className}`}>{children}</span>;
}

function ImageUploadField({ image, onChange, addToast }) {
  const inputRef = useRef(null);
  const [urlDraft, setUrlDraft] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { addToast?.("اختر ملف صورة صالح", "error"); e.target.value = ""; return; }
    if (file.size > 4 * 1024 * 1024) { addToast?.("الصورة كبيرة، اختر أصغر من 4MB", "error"); e.target.value = ""; return; }
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
      addToast?.("تم رفع الصورة ✓");
    } catch {
      addToast?.("تعذّر تحميل الصورة، جرّب صورة ثانية أو استخدم رابط", "error");
    }
    e.target.value = "";
  }
  function applyUrl() {
    if (!urlDraft.trim()) return;
    onChange(urlDraft.trim());
    setUrlDraft("");
    addToast?.("تم إضافة الصورة ✓");
  }

  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl c-fill border c-border-line-strong flex items-center justify-center overflow-hidden shrink-0">
          {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : <span className="c-text-dim3 c-fs-11">لا صورة</span>}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg c-fill hover:c-fill-strong font-bold text-sm">
          رفع صورة من جهازك
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {image && <button type="button" onClick={() => onChange("")} className="p-2 rounded-lg c-soft-bg c-text-dim2 hover:c-text"><Trash2 size={15}/></button>}
      </div>
      <p className="c-fs-10-5 c-text-dim3">إذا زر الرفع ما يفتح معرض الصور على جهازك (بعض المتصفحات/التطبيقات تمنعه داخل المعاينة)، الصق رابط صورة مباشر بدل كذا:</p>
      <div className="flex gap-2">
        <input value={urlDraft} onChange={e => setUrlDraft(e.target.value)} placeholder="https://example.com/image.jpg"
          className="flex-1 c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm" />
        <button type="button" onClick={applyUrl} className="px-4 rounded-lg c-fill hover:c-fill-strong font-bold text-sm">إضافة</button>
      </div>
    </div>
  );
}


function Toasts({ toasts }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 c-z-100 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2.5 rounded-xl text-sm font-bold shadow-xl border backdrop-blur-md c-anim-fadein
          ${t.type === "error" ? "c-bg border-2 c-border-text c-text" : "c-soft-bg c-border-soft c-text-dim"}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function StarRating({ rating, reviews }) {
  return (
    <div className="flex items-center gap-1 text-xs c-text-dim">
      <Star size={13} className="c-fill-text c-text" />
      <span className="font-bold c-text">{rating}</span>
      {reviews != null && <span>({reviews})</span>}
    </div>
  );
}

/* ============================= Header ============================= */
function Header({ page, go, cartCount, user, onOpenMenu, theme, toggleTheme }) {
  const NAV = [
    { id: "home", label: "الرئيسية" },
    { id: "shop", label: "المتجر" },
    { id: "shop-offers", label: "العروض" },
    { id: "orders", label: "الطلبات" },
    { id: "faq", label: "الأسئلة الشائعة" },
    { id: "contact", label: "تواصل معنا" },
  ];
  return (
    <header className="sticky top-0 z-40 c-bg90 backdrop-blur-md border-b c-border-line">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <button onClick={() => go("home")} className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-xl" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>
            متجر <span className="c-text">بطاطا</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <button key={n.id}
              onClick={() => go(n.id === "shop-offers" ? "shop" : n.id, n.id === "shop-offers" ? { offersOnly: true } : undefined)}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${page === n.id ? "c-text c-soft-bg" : "c-text-dim hover:c-text"}`}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} aria-label="تبديل الوضع الداكن/الفاتح"
            className="p-2.5 rounded-xl c-fill hover:c-fill-strong transition-colors">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => go("cart")} className="relative p-2.5 rounded-xl c-fill hover:c-fill-strong transition-colors">
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 c-bg-text c-text-bg c-fs-10 font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => go(user ? (user.isAdmin ? "admin" : "orders") : "login")}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl c-bg-text c-text-bg font-extrabold text-sm hover:brightness-110 transition">
            {user ? (user.isAdmin ? <Settings size={16} /> : <Package size={16} />) : <LogIn size={16} />}
            {user ? (user.isAdmin ? "لوحة التحكم" : user.name) : "تسجيل الدخول"}
          </button>
          <button className="md:hidden p-2.5 rounded-xl c-fill" onClick={onOpenMenu}><Menu size={19} /></button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, close, go, user }) {
  if (!open) return null;
  const NAV = [
    { id: "home", label: "الرئيسية", icon: HomeIcon },
    { id: "shop", label: "المتجر", icon: Store },
    { id: "orders", label: "الطلبات", icon: Package },
    { id: "faq", label: "الأسئلة الشائعة", icon: HelpCircle },
    { id: "contact", label: "تواصل معنا", icon: Phone },
    { id: user ? (user.isAdmin ? "admin" : "orders") : "login", label: user ? (user.isAdmin ? "لوحة التحكم" : "حسابي") : "تسجيل الدخول", icon: LogIn },
  ];
  return (
    <div className="fixed inset-0 z-50 c-bg90 backdrop-blur-lg flex flex-col p-6 md:hidden">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2"><span className="font-extrabold text-lg" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>متجر بطاطا</span></div>
        <button onClick={close} className="p-2 rounded-lg c-fill"><X size={20} /></button>
      </div>
      <div className="flex flex-col gap-2">
        {NAV.map(n => (
          <button key={n.id} onClick={() => { go(n.id); close(); }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl c-fill text-right font-bold c-fs-15">
            <n.icon size={18} className="c-text" /> {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================= Product Card ============================= */
function ProductCard({ p, go, addToCart }) {
  return (
    <div className="group c-bg border-2 c-border-text rounded-2xl overflow-hidden transition-all flex flex-col"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 92% 100%, 0 100%)" }}>
      <button onClick={() => go("product", { id: p.id })} className="relative h-32 flex items-center justify-center c-grad-surface text-5xl overflow-hidden">
        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
        {p.discount ? <Badge className="absolute top-2 right-2 c-soft-bg c-text c-border-soft">خصم {p.discount}%</Badge> : null}
        {p.stock === 0 && <div className="absolute inset-0 c-bg75 flex items-center justify-center text-xs font-bold c-text">نفدت الكمية</div>}
      </button>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <span className="c-fs-10 font-bold c-text-dim">{p.map}</span>
        <button onClick={() => go("product", { id: p.id })} className="text-right c-fs-13-5 font-bold leading-snug line-clamp-2 c-minh-36">{p.name}</button>
        <StarRating rating={p.rating} reviews={p.reviews} />
        <div className="flex items-end justify-between mt-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold c-text" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{p.price} ﷼</span>
            {p.oldPrice && <span className="c-fs-11 c-text-dim2 line-through">{p.oldPrice} ﷼</span>}
          </div>
        </div>
        <div className="flex gap-1.5 mt-2">
          <button disabled={p.stock === 0} onClick={() => addToCart(p, 1)}
            className="flex-1 py-2 rounded-lg c-fill hover:c-fill-strong text-xs font-bold disabled:opacity-40">أضف للسلة</button>
          <button disabled={p.stock === 0} onClick={() => { addToCart(p, 1); go("checkout"); }}
            className="flex-1 py-2 rounded-lg c-bg-text c-text-bg text-xs font-extrabold disabled:opacity-40">شراء الآن</button>
        </div>
      </div>
    </div>
  );
}

/* ============================= Home Page ============================= */
function HomePage({ products, categories, reviews, go, addToCart }) {
  const featured = products.filter(p => p.featured);
  const offers = products.filter(p => p.oldPrice);
  const withDiscount = products.map(p => p.oldPrice ? { ...p, discount: Math.round((1 - p.price / p.oldPrice) * 100) } : p);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b c-border-line">
        <div className="absolute inset-0 c-opacity-08" style={{ backgroundImage: "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative text-center flex flex-col items-center">
          <Badge className="c-soft-bg c-text-dim c-border-soft mb-5">وجهتك الموثوقة لحسابات جاهزة</Badge>
          <h1 className="font-extrabold text-3xl md:text-5xl leading-tight max-w-3xl" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>
            كل الحسابات اللي تدور عليها... في مكان واحد 🥔✨
          </h1>
          <p className="c-text-dim mt-5 max-w-xl leading-8">حسابات مبتدئين، مميزة، VIP ونخبة — بتوثيق واضح وتسليم فوري بعد الدفع.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <button onClick={() => go("shop")} className="px-6 py-3.5 rounded-xl c-bg-text c-text-bg font-extrabold hover:brightness-110 transition">تصفح المتجر</button>
            <button onClick={() => go("shop", { offersOnly: true })} className="px-6 py-3.5 rounded-xl c-fill hover:c-fill-strong font-extrabold transition">شاهد العروض 🔥</button>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-extrabold text-xl mb-8" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>الأقسام</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-8">
          {categories.map(c => (
            <button key={c.id} onClick={() => go("shop", { category: c.id })}
              className="relative flex flex-col items-center gap-1 c-bg border-2 c-border-text rounded-2xl pt-8 pb-3 px-2 transition-colors">
              <span className="absolute -top-7 w-14 h-14 rounded-full c-bg border-2 c-border-text flex items-center justify-center text-2xl overflow-hidden">
                {c.image ? <img src={c.image} alt={c.label} className="w-full h-full object-cover" /> : c.emoji}
              </span>
              <span className="font-extrabold c-fs-13-5 text-center leading-snug mt-1">{c.label}</span>
              <span className="c-fs-11 c-text-dim2 text-center">{c.sub}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-extrabold text-xl flex items-center gap-2" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>
            <Sparkles size={20} className="c-text" /> المنتجات المميزة
          </h2>
          <button onClick={() => go("shop")} className="text-xs font-bold c-text-dim">عرض الكل ←</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} p={withDiscount.find(x=>x.id===p.id)} go={go} addToCart={addToCart} />)}
        </div>
      </section>

      {/* OFFERS */}
      {offers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-extrabold text-xl flex items-center gap-2" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>
              <span className="text-2xl">🔥</span> العروض
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {withDiscount.filter(p => p.oldPrice).map(p => <ProductCard key={p.id} p={p} go={go} addToCart={addToCart} />)}
          </div>
        </section>
      )}

      {/* WHY US */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-extrabold text-xl mb-6 text-center" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>ليش متجر بطاطا؟</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: Zap, label: "تسليم سريع", go: "faq" },
            { icon: Shield, label: "تعامل آمن", go: "faq" },
            { icon: Headphones, label: "دعم العملاء", go: "contact" },
            { icon: Tag, label: "أسعار منافسة", go: "shop", params: { offersOnly: true } },
            { icon: LayoutGrid, label: "منتجات متنوعة", go: "shop" },
          ].map((f, i) => (
            <button key={i} onClick={() => go(f.go, f.params)}
              className="flex flex-col items-center gap-2.5 c-surface border c-border-line hover:c-border-soft rounded-2xl py-6 px-2 text-center transition-colors">
              <f.icon size={22} className="c-text-dim" />
              <span className="c-fs-12-5 font-bold">{f.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* REVIEWS - حقيقية فقط، مربوطة بطلبات فعلية */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="font-extrabold text-xl mb-6" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>آراء العملاء</h2>
        {reviews && reviews.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="c-surface border c-border-line rounded-2xl p-5">
                <div className="flex gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={14} className={s < r.rating ? "c-fill-text c-text" : "c-text-dim3"} />)}</div>
                <p className="text-sm c-text-dim leading-7">{r.text}</p>
                <span className="text-xs font-bold c-text-dim3 mt-3 block">- {r.customer_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="c-surface border c-border-line rounded-2xl p-8 text-center c-text-dim2 text-sm">
            لسا ما وصلتنا مراجعات حقيقية — كن أول عميل يقيّم تجربته بعد إتمام طلبك 🥔
          </div>
        )}
      </section>
    </div>
  );
}
function ShopPage({ products, categories, go, addToCart, initialFilters }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialFilters?.category || "all");
  const [map, setMap] = useState("الكل");
  const [sort, setSort] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(200);
  const offersOnly = !!initialFilters?.offersOnly;

  let list = products.filter(p =>
    (offersOnly ? !!p.oldPrice : true) &&
    (category === "all" || p.category === category) &&
    (map === "الكل" || p.map === map) &&
    p.price <= maxPrice &&
    (search.trim() === "" || p.name.includes(search.trim()))
  );
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === "bestselling") list = [...list].sort((a, b) => b.reviews - a.reviews);
  else list = [...list].sort((a, b) => (b.id > a.id ? 1 : -1));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-extrabold text-2xl mb-5" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>
        {offersOnly ? "🔥 العروض" : "المتجر"}
      </h1>

      <div className="flex items-center gap-2 c-surface border c-border-line rounded-xl px-4 py-3 mb-5">
        <Search size={17} className="c-text-dim2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن منتج..."
          className="bg-transparent outline-none text-sm flex-1 placeholder:c-text-dim3" />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setCategory("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${category === "all" ? "c-bg-text c-text-bg c-border-text" : "c-fill c-border-line-strong c-text-dim"}`}>الكل</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${category === c.id ? "c-bg-text c-text-bg c-border-text" : "c-fill c-border-line-strong c-text-dim"}`}>{c.emoji} {c.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 c-surface border c-border-line rounded-xl p-4">
        <div>
          <label className="c-fs-11 font-bold c-text-dim2 block mb-1.5">حالة التوثيق</label>
          <select value={map} onChange={e => setMap(e.target.value)} className="w-full c-bg border c-border-line-strong rounded-lg px-2.5 py-2 text-xs">
            {MAPS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="c-fs-11 font-bold c-text-dim2 block mb-1.5">الترتيب</label>
          <select value={sort} onChange={e => setSort(e.target.value)} className="w-full c-bg border c-border-line-strong rounded-lg px-2.5 py-2 text-xs">
            <option value="newest">الأحدث</option>
            <option value="bestselling">الأكثر مبيعاً</option>
            <option value="price-asc">السعر: من الأقل</option>
            <option value="price-desc">السعر: من الأعلى</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="c-fs-11 font-bold c-text-dim2 block mb-1.5">الحد الأعلى للسعر: {maxPrice} ﷼</label>
          <input type="range" min="5" max="200" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} className="w-full c-accent-text" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 c-text-dim2">ما فيه منتجات مطابقة لبحثك 🥔</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {list.map(p => <ProductCard key={p.id} p={p.oldPrice ? { ...p, discount: Math.round((1 - p.price / p.oldPrice) * 100) } : p} go={go} addToCart={addToCart} />)}
        </div>
      )}
    </div>
  );
}

/* ============================= Product Page ============================= */
function ProductPage({ products, id, go, addToCart }) {
  const p = products.find(x => x.id === id);
  const [qty, setQty] = useState(1);
  if (!p) return <div className="max-w-6xl mx-auto px-4 py-20 text-center c-text-dim2">المنتج غير موجود</div>;
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div className="h-64 md:h-full rounded-2xl c-grad-surface flex items-center justify-center text-8xl overflow-hidden">
        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : p.emoji}
      </div>
      <div>
        <button onClick={() => go("shop")} className="text-xs font-bold c-text-dim mb-3 flex items-center gap-1"><ChevronRight size={14}/> رجوع للمتجر</button>
        <Badge className="c-soft-bg c-text-dim c-border-soft mb-3">{p.map}</Badge>
        <h1 className="font-extrabold text-2xl mb-2" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>{p.name}</h1>
        <StarRating rating={p.rating} reviews={p.reviews} />
        <div className="flex items-baseline gap-2 mt-4">
          <span className="font-extrabold text-3xl c-text" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>{p.price} ﷼</span>
          {p.oldPrice && <span className="text-sm c-text-dim2 line-through">{p.oldPrice} ﷼</span>}
          {discount && <Badge className="c-soft-bg c-text c-border-soft">خصم {discount}%</Badge>}
        </div>
        <p className="c-text-dim leading-8 mt-4 text-sm">{p.description}</p>
        <div className="grid grid-cols-2 gap-3 mt-5 text-xs">
          <div className="c-surface border c-border-line rounded-xl p-3"><span className="c-text-dim2 block mb-1">التوفر</span><span className="font-bold">{p.stock > 0 ? `${p.stock} متوفر` : "غير متوفر"}</span></div>
          <div className="c-surface border c-border-line rounded-xl p-3 flex items-center gap-1.5"><Clock size={14} className="c-text-dim"/><span className="font-bold">{p.delivery}</span></div>
        </div>
        <div className="c-surface border c-border-line rounded-xl p-3 mt-3 text-xs c-text-dim leading-6">
          ⚠️ معلومة مهمة: تأكد من صحة بريدك الإلكتروني قبل الشراء. التسليم يتم عبر البريد الإلكتروني فور الدفع.
        </div>

        <div className="flex items-center gap-3 mt-6">
          <div className="flex items-center gap-3 c-surface border c-border-line-strong rounded-xl px-3 py-2">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={15}/></button>
            <span className="font-bold w-5 text-center">{qty}</span>
            <button onClick={() => setQty(q => q + 1)}><Plus size={15}/></button>
          </div>
          <button disabled={p.stock===0} onClick={() => addToCart(p, qty)} className="flex-1 py-3 rounded-xl c-fill hover:c-fill-strong font-extrabold text-sm disabled:opacity-40">أضف للسلة</button>
          <button disabled={p.stock===0} onClick={() => { addToCart(p, qty); go("checkout"); }} className="flex-1 py-3 rounded-xl c-bg-text c-text-bg font-extrabold text-sm disabled:opacity-40">شراء الآن</button>
        </div>
      </div>
    </div>
  );
}

/* ============================= Cart Page ============================= */
function CartPage({ cart, products, updateQty, removeFromCart, go }) {
  const items = cart.map(c => ({ ...c, product: products.find(p => p.id === c.productId) })).filter(c => c.product);
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  if (items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">🛒</div>
      <p className="c-text-dim mb-6">سلتك فاضية حالياً</p>
      <button onClick={() => go("shop")} className="px-6 py-3 rounded-xl c-bg-text c-text-bg font-extrabold">تصفح المتجر</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl mb-6" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>السلة</h1>
      <div className="flex flex-col gap-3">
        {items.map(i => (
          <div key={i.productId} className="flex items-center gap-3 c-surface border c-border-line rounded-xl p-3">
            <div className="w-14 h-14 rounded-lg c-surface2 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {i.product.image ? <img src={i.product.image} alt="" className="w-full h-full object-cover" /> : i.product.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{i.product.name}</div>
              <div className="c-text font-extrabold text-sm">{i.product.price} ﷼</div>
            </div>
            <div className="flex items-center gap-2 c-bg border c-border-line-strong rounded-lg px-2 py-1">
              <button onClick={() => updateQty(i.productId, i.qty - 1)}><Minus size={13}/></button>
              <span className="w-5 text-center text-sm font-bold">{i.qty}</span>
              <button onClick={() => updateQty(i.productId, i.qty + 1)}><Plus size={13}/></button>
            </div>
            <button onClick={() => removeFromCart(i.productId)} className="p-2 c-text-dim2 hover:c-text"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-6 c-surface border c-border-line rounded-xl p-4">
        <span className="font-bold c-text-dim">الإجمالي</span>
        <span className="font-extrabold text-xl c-text">{total} ﷼</span>
      </div>
      <button onClick={() => go("checkout")} className="w-full mt-4 py-3.5 rounded-xl c-bg-text c-text-bg font-extrabold">إتمام الطلب</button>
    </div>
  );
}

/* ============================= Checkout Page ============================= */
function CheckoutPage({ cart, products, placeOrder, go, user }) {
  const items = cart.map(c => ({ ...c, product: products.find(p => p.id === c.productId) })).filter(c => c.product);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(null);
  const [email, setEmail] = useState("");
  const discountAmount = applied ? Math.round(subtotal * applied.pct) : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid;

  if (items.length === 0) return <div className="max-w-3xl mx-auto px-4 py-24 text-center c-text-dim2">لا يوجد منتجات في السلة</div>;

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === "BATATA10") setApplied({ code: "BATATA10", pct: 0.1 });
    else setApplied(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl mb-6" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>إتمام الطلب</h1>

      <div className="c-surface border c-border-line rounded-xl p-4 mb-4">
        <label className="text-xs font-bold c-text-dim2 block mb-2">بريدك الإلكتروني (لاستلام بيانات الحساب)</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="w-full c-bg border c-border-line-strong rounded-lg px-3 py-2.5 text-sm outline-none focus:c-border-text" />
        <p className="c-fs-10-5 c-text-dim3 mt-1.5">بنرسل لك اسم المستخدم وكلمة المرور على هذا الإيميل بعد الدفع.</p>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {items.map(i => (
          <div key={i.productId} className="flex justify-between text-sm c-surface border c-border-line rounded-lg px-4 py-3">
            <span>{i.product.name} × {i.qty}</span>
            <span className="font-bold">{i.product.price * i.qty} ﷼</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="كوبون خصم" className="flex-1 c-surface border c-border-line-strong rounded-lg px-3 py-2.5 text-sm outline-none" />
        <button onClick={applyCoupon} className="px-4 rounded-lg c-fill font-bold text-sm">تطبيق</button>
      </div>
      {applied && <div className="text-xs c-text-dim mb-3">تم تطبيق كوبون {applied.code} (خصم 10%) ✓</div>}

      <div className="c-surface border c-border-line rounded-xl p-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between c-text-dim"><span>المجموع الفرعي</span><span>{subtotal} ﷼</span></div>
        {applied && <div className="flex justify-between c-text-dim"><span>الخصم</span><span>-{discountAmount} ﷼</span></div>}
        <div className="flex justify-between font-extrabold text-lg pt-2 border-t c-border-line-strong"><span>الإجمالي</span><span className="c-text">{total} ﷼</span></div>
      </div>

      <div className="c-fs-11 c-text-dim2 mt-3 leading-6">
        💳 بوابة الدفع غير مفعّلة بعد في هذه النسخة التجريبية — عند ربطها لاحقاً ببوابة دفع حقيقية سيتم تحويلك لصفحة الدفع الآمن هنا.
      </div>

      <button
        onClick={() => { if (!canSubmit) return; placeOrder(items, total, null, email.trim() || null); }}
        disabled={!canSubmit}
        className="w-full mt-5 py-3.5 rounded-xl c-bg-text c-text-bg font-extrabold disabled:opacity-40">
        تأكيد الطلب والدفع
      </button>
    </div>
  );
}

/* ============================= Orders Page ============================= */
function ReviewForm({ orderId, submitReview, onDone }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  async function submit() {
    if (!name.trim() || !text.trim()) return;
    setSending(true);
    const ok = await submitReview(orderId, name.trim(), rating, text.trim());
    setSending(false);
    if (ok) onDone();
  }
  return (
    <div className="mt-3 pt-3 border-t c-border-line-strong flex flex-col gap-2">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك" className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-xs" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} type="button">
            <Star size={18} className={n <= rating ? "c-fill-text c-text" : "c-text-dim3"} />
          </button>
        ))}
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="شاركنا تجربتك مع الطلب..." rows={2} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-xs" />
      <button onClick={submit} disabled={sending || !name.trim() || !text.trim()} className="py-2 rounded-lg c-bg-text c-text-bg font-extrabold text-xs disabled:opacity-40">
        {sending ? "جاري الإرسال..." : "إرسال المراجعة"}
      </button>
    </div>
  );
}

function OrdersPage({ orders, go, submitReview }) {
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);

  if (orders.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">📦</div>
      <p className="c-text-dim mb-6">ما عندك طلبات لسا</p>
      <button onClick={() => go("shop")} className="px-6 py-3 rounded-xl c-bg-text c-text-bg font-extrabold">تصفح المتجر</button>
    </div>
  );
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-extrabold text-2xl mb-6" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>طلباتي</h1>
      <div className="flex flex-col gap-3">
        {[...orders].reverse().map(o => (
          <div key={o.id} className="c-surface border c-border-line rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm">طلب #{o.id}</span>
              <Badge className={STATUS_STYLES[o.status]}>{o.status}</Badge>
            </div>
            <div className="text-xs c-text-dim2 mb-2">{new Date(o.date).toLocaleString("ar-SA")}</div>
            <div className="flex flex-col gap-1 mb-2">
              {o.items.map((i, idx) => <div key={idx} className="text-xs c-text-dim">{i.product.emoji} {i.product.name} × {i.qty}</div>)}
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t c-border-line-strong">
              <span className="c-text-dim2">الإجمالي</span><span className="c-text">{o.total} ﷼</span>
            </div>

            {reviewedIds.includes(o.id) ? (
              <p className="c-fs-11 c-text-dim mt-3 pt-3 border-t c-border-line-strong">✓ شكرًا، تم إرسال مراجعتك لهذا الطلب</p>
            ) : reviewingId === o.id ? (
              <ReviewForm orderId={o.id} submitReview={submitReview} onDone={() => { setReviewedIds(p => [...p, o.id]); setReviewingId(null); }} />
            ) : (
              <button onClick={() => setReviewingId(o.id)} className="c-fs-11 font-bold c-text-dim mt-3 pt-3 border-t c-border-line-strong w-full text-right">اترك تقييمك لهذا الطلب ✍️</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================= Login Page ============================= */
function LoginPage({ login, go }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit() {
    if (!phone.trim()) return;
    setLoading(true);
    await login(phone.trim(), password);
    setLoading(false);
  }
  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="font-extrabold text-4xl" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>بطاطا</span>
        <h1 className="font-extrabold text-2xl mt-4" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>تسجيل الدخول</h1>
        <p className="c-text-dim2 text-xs mt-1">ادخل حسابك في متجر بطاطا</p>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-bold c-text-dim2 block mb-1.5">رقم الجوال أو الإيميل</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="05xxxxxxxx" className="w-full c-surface border c-border-line-strong rounded-xl px-3.5 py-3 text-sm outline-none focus:c-border-text" />
        </div>
        <div>
          <label className="text-xs font-bold c-text-dim2 block mb-1.5">كلمة المرور</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full c-surface border c-border-line-strong rounded-xl px-3.5 py-3 text-sm outline-none focus:c-border-text" />
        </div>
        <button onClick={handleSubmit} disabled={!phone.trim() || loading}
          className="w-full mt-2 py-3.5 rounded-xl c-bg-text c-text-bg font-extrabold disabled:opacity-40">{loading ? "جاري الدخول..." : "دخول"}</button>
        <p className="text-center c-fs-10-5 c-text-dim3 mt-2 leading-5">
          إذا عندك حساب أدمن، ادخل بالإيميل وكلمة المرور الحقيقيين. غير كذا راح تدخل كزائر للتسوق فقط.
        </p>
      </div>
    </div>
  );
}

/* ============================= FAQ / Contact ============================= */
function FaqPage() {
  const faqs = [
    { q: "هل متجر بطاطا شركة رسمية أو موزّع معتمد؟", a: "لا، متجر بطاطا منصة مستقلة لبيع حسابات جاهزة، غير تابعة لأي جهة خارجية." },
    { q: "كم مدة التسليم؟", a: "تختلف حسب المنتج، غالباً بين 5 إلى 30 دقيقة، موضحة في صفحة كل منتج." },
    { q: "هل فيه ضمان استرجاع؟", a: "نعم، حسب سياسة الاسترجاع الموضحة في الفوتر." },
    { q: "كيف أتواصل مع الدعم؟", a: "عبر صفحة تواصل معنا أو قنوات التواصل الاجتماعي بالفوتر." },
  ];
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-extrabold text-2xl mb-6" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>الأسئلة الشائعة</h1>
      <div className="flex flex-col gap-2">
        {faqs.map((f, i) => (
          <div key={i} className="c-surface border c-border-line rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center px-4 py-3.5 text-right font-bold text-sm">
              {f.q} <ChevronLeft size={16} className={`transition-transform ${open === i ? "-rotate-90" : ""}`} />
            </button>
            {open === i && <div className="px-4 pb-4 text-sm c-text-dim leading-7">{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPage({ go }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <h1 className="font-extrabold text-2xl mb-3" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>تواصل معنا</h1>
      <p className="c-text-dim text-sm mb-8">فريق الدعم جاهز يساعدك بأي استفسار</p>
      <div className="flex flex-col gap-3">
        <a href="mailto:2aymanm.asd@gmail.com" className="flex items-center gap-3 c-surface border c-border-line rounded-xl px-4 py-3.5">
          <span className="c-text">✉️</span> 2aymanm.asd@gmail.com
        </a>
        <a href="#" className="flex items-center gap-3 c-surface border c-border-line rounded-xl px-4 py-3.5"><MessageCircle size={18} className="c-text-dim"/> Discord</a>
        <a href="#" className="flex items-center gap-3 c-surface border c-border-line rounded-xl px-4 py-3.5"><Instagram size={18} className="c-text"/> Instagram</a>
        <a href="#" className="flex items-center gap-3 c-surface border c-border-line rounded-xl px-4 py-3.5"><TrendingUp size={18} className="c-text"/> TikTok</a>
      </div>
      <p className="c-fs-11 c-text-dim3 mt-6 leading-6">راجع كمان <button onClick={() => go("terms")} className="underline">شروط الاستخدام</button>، <button onClick={() => go("privacy")} className="underline">سياسة الخصوصية</button>، و<button onClick={() => go("refund")} className="underline">سياسة الاسترجاع</button>.</p>
    </div>
  );
}

function LegalPage({ title, children }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h1 className="font-extrabold text-2xl mb-6" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>{title}</h1>
      <div className="flex flex-col gap-4 text-sm c-text-dim leading-8">{children}</div>
    </div>
  );
}

function TermsPage() {
  return (
    <LegalPage title="شروط الاستخدام">
      <p>مرحبًا بك في متجر بطاطا. باستخدامك لهذا الموقع فإنك توافق على الشروط التالية:</p>
      <p><b className="c-text">1. طبيعة المتجر:</b> متجر بطاطا منصة مستقلة لبيع حسابات جاهزة، وغير تابع لأي جهة أو شركة خارجية.</p>
      <p><b className="c-text">2. المنتجات:</b> نبيع حسابات جاهزة فقط. التسليم يتم إلكترونيًا عبر البريد الإلكتروني بعد إتمام الدفع.</p>
      <p><b className="c-text">3. مسؤولية المستخدم:</b> يجب أن تكون بياناتك (بريدك الإلكتروني) صحيحة عند الطلب، ونحن غير مسؤولين عن أي خطأ ناتج عن بيانات غير صحيحة أدخلها المستخدم.</p>
      <p><b className="c-text">4. الأسعار:</b> جميع الأسعار معروضة بالريال السعودي وقابلة للتغيير دون إشعار مسبق.</p>
      <p><b className="c-text">5. الاستخدام المقبول:</b> يُمنع استخدام الموقع لأي غرض غير قانوني أو محاولة الإضرار به.</p>
      <p>لأي استفسار حول هذه الشروط، تواصل معنا عبر صفحة "تواصل معنا".</p>
    </LegalPage>
  );
}

function PrivacyPage() {
  return (
    <LegalPage title="سياسة الخصوصية">
      <p>نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
      <p><b className="c-text">البيانات التي نجمعها:</b> بريدك الإلكتروني عند إتمام طلب، فقط لغرض تسليم بيانات الحساب والتواصل معك بخصوص طلبك.</p>
      <p><b className="c-text">كيف نستخدم بياناتك:</b> نستخدمها فقط لتنفيذ طلبك وإرسال بيانات المنتج (مثل بيانات حساب) وتقديم الدعم الفني.</p>
      <p><b className="c-text">مشاركة البيانات:</b> لا نبيع أو نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية. قد نشارك بيانات الدفع الضرورية فقط مع بوابة الدفع المستخدمة لإتمام العملية.</p>
      <p><b className="c-text">حماية البيانات:</b> بياناتك مخزّنة على خوادم آمنة (Supabase) مع سياسات وصول محدودة.</p>
      <p>لأي استفسار حول بياناتك، تواصل معنا عبر صفحة "تواصل معنا".</p>
    </LegalPage>
  );
}

function RefundPage() {
  return (
    <LegalPage title="سياسة الاسترجاع">
      <p>نظرًا لطبيعة المنتجات الرقمية، تُطبّق سياسة الاسترجاع التالية:</p>
      <p><b className="c-text">1. الحسابات المُسلَّمة:</b> بما أن الحسابات تُسلَّم إلكترونيًا فور الدفع، لا يمكن استرجاعها بعد التسليم الناجح إلا في حالات الخطأ من طرفنا.</p>
      <p><b className="c-text">2. حالات الاسترجاع المقبولة:</b>
        <br />- عدم تسليم المنتج خلال المدة المعلنة
        <br />- تسليم منتج مختلف عمّا تم طلبه
        <br />- مشكلة تقنية أدت لعدم استلام بيانات الحساب</p>
      <p><b className="c-text">3. آلية الاسترجاع:</b> تواصل معنا خلال 48 ساعة من الطلب عبر صفحة "تواصل معنا" مع ذكر رقم الطلب، وسنراجع الحالة ونرد خلال 3 أيام عمل.</p>
      <p><b className="c-text">4. طريقة الاسترجاع:</b> يتم الاسترجاع بنفس وسيلة الدفع الأصلية خلال مدة تعتمد على بوابة الدفع المستخدمة.</p>
    </LegalPage>
  );
}

/* ============================= Admin Dashboard ============================= */
function SendAccountEmailForm({ order, addToast }) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!username.trim() || !password.trim()) { addToast("عبّي اسم المستخدم وكلمة المرور", "error"); return; }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-account-email", {
      body: { to: order.email, orderId: order.id, username: username.trim(), password: password.trim() },
    });
    setSending(false);
    if (error || data?.error) { addToast("تعذّر إرسال الإيميل، تأكد من إعداد Resend", "error"); return; }
    setSent(true);
    setOpen(false);
    addToast("تم إرسال بيانات الحساب فعليًا ✓");
  }

  if (sent) return <p className="c-fs-11 c-text-dim mb-2">✓ تم إرسال بيانات الحساب لهذا الطلب</p>;

  if (!open) return (
    <button onClick={() => setOpen(true)} className="c-fs-11 font-bold c-bg-text c-text-bg px-3 py-1.5 rounded-lg mb-2">📧 إرسال بيانات الحساب</button>
  );

  return (
    <div className="c-fill rounded-lg p-3 mb-2 flex flex-col gap-2">
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم / يوزر الحساب" className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-xs" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-xs" />
      <div className="flex gap-2">
        <button onClick={send} disabled={sending} className="flex-1 py-2 rounded-lg c-bg-text c-text-bg font-extrabold text-xs disabled:opacity-40">{sending ? "جاري الإرسال..." : "إرسال الآن"}</button>
        <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg c-fill text-xs">إلغاء</button>
      </div>
    </div>
  );
}

function AdminPage({ products, categories, refreshProducts, refreshCategories, addToast, logout, userEmail }) {
  const [tab, setTab] = useState("products");
  const [editing, setEditing] = useState(null);
  const emptyForm = { name: "", category: "starter", map: "غير موثق", price: "", oldPrice: "", stock: "", emoji: "🥔", image: "", description: "", delivery: "" };
  const [form, setForm] = useState(emptyForm);

  const [editingCat, setEditingCat] = useState(null);
  const emptyCatForm = { label: "", sub: "", emoji: "🎮", image: "" };
  const [catForm, setCatForm] = useState(emptyCatForm);

  const [adminOrders, setAdminOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function loadOrders() {
    setOrdersLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && data) setAdminOrders(data.map(dbToOrder));
    setOrdersLoading(false);
  }
  useEffect(() => { if (tab === "orders" || tab === "stats") loadOrders(); }, [tab]);

  const stats = useMemo(() => {
    const completed = adminOrders.filter(o => o.status === "مكتمل" || o.status === "تم التسليم");
    const revenue = completed.reduce((s, o) => s + o.total, 0);
    const productSales = {};
    adminOrders.forEach(o => o.items.forEach(i => { productSales[i.product.name] = (productSales[i.product.name] || 0) + i.qty; }));
    const top = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0];
    return { revenue, count: adminOrders.length, top: top ? top[0] : "—" };
  }, [adminOrders]);

  function startEdit(p) {
    setEditing(p.id);
    setForm({ name: p.name, category: p.category, map: p.map, price: p.price, oldPrice: p.oldPrice || "", stock: p.stock, emoji: p.emoji, image: p.image || "", description: p.description, delivery: p.delivery });
  }
  function startNew() { setEditing("new"); setForm(emptyForm); }

  function startEditCat(c) {
    setEditingCat(c.id);
    setCatForm({ label: c.label, sub: c.sub || "", emoji: c.emoji, image: c.image || "" });
  }
  function startNewCat() { setEditingCat("new"); setCatForm(emptyCatForm); }

  async function saveCategory() {
    if (!catForm.label.trim()) { addToast("عبّي اسم القسم", "error"); return; }
    if (editingCat === "new") {
      const { error } = await supabase.from("categories").insert({ id: "c" + Date.now(), ...catForm });
      if (error) { addToast("تعذّر إضافة القسم", "error"); return; }
      addToast("تمت إضافة القسم ✓");
    } else {
      const { error } = await supabase.from("categories").update(catForm).eq("id", editingCat);
      if (error) { addToast("تعذّر حفظ القسم", "error"); return; }
      addToast("تم حفظ القسم ✓");
    }
    setEditingCat(null);
    refreshCategories();
  }
  async function deleteCategory(id) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { addToast("تعذّر حذف القسم", "error"); return; }
    addToast("تم حذف القسم");
    refreshCategories();
  }

  async function saveProduct() {
    if (!form.name.trim() || !form.price) { addToast("عبّي الاسم والسعر على الأقل", "error"); return; }
    if (editing === "new") {
      const payload = productToDb({ id: "p" + Date.now(), ...form, price: +form.price, oldPrice: form.oldPrice ? +form.oldPrice : null, stock: +form.stock || 0 });
      const { error } = await supabase.from("products").insert(payload);
      if (error) { addToast("تعذّر إضافة المنتج", "error"); return; }
      addToast("تمت إضافة المنتج ✓");
    } else {
      const payload = productToDb({ ...form, price: +form.price, oldPrice: form.oldPrice ? +form.oldPrice : null, stock: +form.stock || 0 });
      delete payload.id;
      const { error } = await supabase.from("products").update(payload).eq("id", editing);
      if (error) { addToast("تعذّر حفظ التعديلات", "error"); return; }
      addToast("تم حفظ التعديلات ✓");
    }
    setEditing(null);
    refreshProducts();
  }
  async function deleteProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { addToast("تعذّر حذف المنتج", "error"); return; }
    addToast("تم حذف المنتج");
    refreshProducts();
  }
  async function updateOrderStatus(id, status) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { addToast("تعذّر تحديث الحالة", "error"); return; }
    addToast("تم تحديث حالة الطلب ✓");
    loadOrders();
  }

  async function changePassword() {
    if (newPassword.length < 6) { addToast("كلمة المرور لازم تكون 6 أحرف على الأقل", "error"); return; }
    if (newPassword !== confirmPassword) { addToast("كلمتا المرور غير متطابقتين", "error"); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) { addToast("تعذّر تغيير كلمة المرور: " + error.message, "error"); return; }
    setNewPassword(""); setConfirmPassword("");
    addToast("تم تغيير كلمة المرور بنجاح ✓");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>لوحة تحكم المتجر</h1>
        <button onClick={logout} className="c-fs-12 font-bold c-text-dim2 hover:c-text px-3 py-2 rounded-lg c-fill">تسجيل خروج</button>
      </div>
      <p className="text-xs c-text-dim2 mb-6">مسجّل دخول كـ {userEmail} — البيانات هنا حقيقية ومتصلة بقاعدة بيانات Supabase، تظهر لكل زوار الموقع.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[["products", "المنتجات"], ["categories", "الأقسام"], ["orders", "الطلبات"], ["stats", "الإحصائيات"], ["settings", "الإعدادات"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-bold ${tab === id ? "c-bg-text c-text-bg" : "c-fill c-text-dim"}`}>{label}</button>
        ))}
      </div>

      {tab === "products" && (
        <div>
          <button onClick={startNew} className="mb-4 flex items-center gap-1.5 px-4 py-2.5 rounded-lg c-soft-bg c-text-dim font-bold text-sm"><Plus size={15}/> إضافة منتج</button>

          {editing && (
            <div className="c-surface border c-border-soft rounded-xl p-4 mb-5 grid md:grid-cols-2 gap-3">
              <input placeholder="اسم المنتج" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm md:col-span-2" />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm">
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <select value={form.map} onChange={e => setForm({ ...form, map: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm">
                {MAPS.filter(m => m !== "الكل").map(m => <option key={m}>{m}</option>)}
              </select>
              <input placeholder="السعر" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm" />
              <input placeholder="السعر قبل الخصم (اختياري)" type="number" value={form.oldPrice} onChange={e => setForm({ ...form, oldPrice: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm" />
              <input placeholder="المخزون" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm" />
              <input placeholder="إيموجي (احتياطي إذا ما رفعت صورة)" value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm" />
              <ImageUploadField image={form.image} onChange={(img) => setForm({ ...form, image: img })} addToast={addToast} />
              <input placeholder="مدة التسليم" value={form.delivery} onChange={e => setForm({ ...form, delivery: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm md:col-span-2" />
              <textarea placeholder="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm md:col-span-2" rows={2} />
              <div className="md:col-span-2 flex gap-2">
                <button onClick={saveProduct} className="flex-1 py-2.5 rounded-lg c-bg-text c-text-bg font-extrabold text-sm flex items-center justify-center gap-1.5"><Check size={15}/> حفظ</button>
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-lg c-fill font-bold text-sm">إلغاء</button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-3 c-surface border c-border-line rounded-xl p-3">
                <div className="w-11 h-11 rounded-lg c-surface2 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{p.name}</div>
                  <div className="text-xs c-text-dim2">{p.map} · مخزون {p.stock} · {p.price} ﷼</div>
                </div>
                <button onClick={() => startEdit(p)} className="p-2 rounded-lg c-fill"><Edit3 size={15}/></button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg c-soft-bg c-text-dim2 hover:c-text"><Trash2 size={15}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div>
          <button onClick={startNewCat} className="mb-4 flex items-center gap-1.5 px-4 py-2.5 rounded-lg c-soft-bg c-text-dim font-bold text-sm"><Plus size={15}/> إضافة قسم</button>

          {editingCat && (
            <div className="c-surface border c-border-soft rounded-xl p-4 mb-5 grid md:grid-cols-2 gap-3">
              <input placeholder="اسم القسم (عربي)" value={catForm.label} onChange={e => setCatForm({ ...catForm, label: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm" />
              <input placeholder="عنوان فرعي (إنجليزي)" value={catForm.sub} onChange={e => setCatForm({ ...catForm, sub: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm" />
              <input placeholder="إيموجي (احتياطي إذا ما رفعت صورة)" value={catForm.emoji} onChange={e => setCatForm({ ...catForm, emoji: e.target.value })} className="c-bg border c-border-line-strong rounded-lg px-3 py-2 text-sm md:col-span-2" />
              <ImageUploadField image={catForm.image} onChange={(img) => setCatForm({ ...catForm, image: img })} addToast={addToast} />
              <div className="md:col-span-2 flex gap-2">
                <button onClick={saveCategory} className="flex-1 py-2.5 rounded-lg c-bg-text c-text-bg font-extrabold text-sm flex items-center justify-center gap-1.5"><Check size={15}/> حفظ</button>
                <button onClick={() => setEditingCat(null)} className="flex-1 py-2.5 rounded-lg c-fill font-bold text-sm">إلغاء</button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-3 c-surface border c-border-line rounded-xl p-3">
                <div className="w-11 h-11 rounded-lg c-surface2 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {c.image ? <img src={c.image} alt="" className="w-full h-full object-cover" /> : c.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{c.label}</div>
                  <div className="text-xs c-text-dim2">{c.sub}</div>
                </div>
                <button onClick={() => startEditCat(c)} className="p-2 rounded-lg c-fill"><Edit3 size={15}/></button>
                <button onClick={() => deleteCategory(c.id)} className="p-2 rounded-lg c-soft-bg c-text-dim2 hover:c-text"><Trash2 size={15}/></button>
              </div>
            ))}
            {categories.length === 0 && <p className="c-text-dim2 text-sm">لا يوجد أقسام بعد.</p>}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="flex flex-col gap-2">
          {ordersLoading && <p className="c-text-dim2 text-sm">جاري التحميل...</p>}
          {!ordersLoading && adminOrders.length === 0 && <p className="c-text-dim2 text-sm">لا يوجد طلبات بعد.</p>}
          {adminOrders.map(o => (
            <div key={o.id} className="c-surface border c-border-line rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-sm">طلب #{o.id}{o.gameId ? " — " + o.gameId : ""}</span>
                <span className="font-extrabold c-text text-sm">{o.total} ﷼</span>
              </div>
              {o.email && (
                <>
                  <div className="c-fs-11 c-text-dim2 mb-1">📧 {o.email}</div>
                  <SendAccountEmailForm order={o} addToast={addToast} />
                </>
              )}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {o.items.map((i, idx) => <span key={idx} className="c-fs-11 c-fill rounded-md px-2 py-1">{i.product.emoji} {i.product.name} ×{i.qty}</span>)}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_LIST.map(s => (
                  <button key={s} onClick={() => updateOrderStatus(o.id, s)} className={`c-fs-11 font-bold px-2.5 py-1.5 rounded-md border ${o.status === s ? STATUS_STYLES[s] : "c-fill c-border-line-strong c-text-dim2"}`}>{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="c-surface border c-border-line rounded-xl p-5"><div className="text-xs c-text-dim2 mb-1">إجمالي الطلبات</div><div className="font-extrabold text-2xl c-text">{stats.count}</div></div>
          <div className="c-surface border c-border-line rounded-xl p-5"><div className="text-xs c-text-dim2 mb-1">الإيرادات (طلبات مكتملة)</div><div className="font-extrabold text-2xl c-text-dim">{stats.revenue} ﷼</div></div>
          <div className="c-surface border c-border-line rounded-xl p-5"><div className="text-xs c-text-dim2 mb-1">الأكثر مبيعاً</div><div className="font-extrabold text-sm mt-1.5">{stats.top}</div></div>
        </div>
      )}

      {tab === "settings" && (
        <div className="max-w-sm">
          <div className="c-surface border c-border-line rounded-xl p-4 flex flex-col gap-3">
            <h3 className="font-extrabold text-sm">تغيير كلمة مرور الأدمن</h3>
            <div>
              <label className="text-xs font-bold c-text-dim2 block mb-1.5">كلمة المرور الجديدة</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full c-bg border c-border-line-strong rounded-lg px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold c-text-dim2 block mb-1.5">تأكيد كلمة المرور</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full c-bg border c-border-line-strong rounded-lg px-3 py-2.5 text-sm" />
            </div>
            <button onClick={changePassword} disabled={savingPassword} className="py-2.5 rounded-lg c-bg-text c-text-bg font-extrabold text-sm disabled:opacity-50">
              {savingPassword ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            </button>
            <p className="c-fs-10-5 c-text-dim3 leading-5">
              هذا يغيّر كلمة المرور فعليًا عبر نظام تسجيل الدخول الآمن (Supabase Auth). تغيير البريد الإلكتروني نفسه يحتاج تأكيد عبر بريد إلكتروني جديد، تقدر تسويه من لوحة Supabase مباشرة إذا احتجت.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================= Footer ============================= */
function Footer({ go }) {
  return (
    <footer className="border-t c-border-line mt-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3"><span className="font-extrabold" style={{ fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>متجر بطاطا</span></div>
          <p className="text-xs c-text-dim2 leading-6">وجهتك لكل الحسابات الجاهزة — مبتدئين، مميزة، VIP ونخبة.</p>
        </div>
        <div>
          <div className="font-bold mb-3 text-xs c-text-dim2">روابط الموقع</div>
          <div className="flex flex-col gap-2 text-xs">
            <button onClick={() => go("home")} className="text-right c-text-dim">الرئيسية</button>
            <button onClick={() => go("shop")} className="text-right c-text-dim">المتجر</button>
            <button onClick={() => go("faq")} className="text-right c-text-dim">الأسئلة الشائعة</button>
            <button onClick={() => go("contact")} className="text-right c-text-dim">تواصل معنا</button>
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-xs c-text-dim2">السياسات</div>
          <div className="flex flex-col gap-2 text-xs c-text-dim">
            <button onClick={() => go("privacy")} className="text-right">سياسة الخصوصية</button>
            <button onClick={() => go("terms")} className="text-right">شروط الاستخدام</button>
            <button onClick={() => go("refund")} className="text-right">سياسة الاسترجاع</button>
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-xs c-text-dim2">تابعنا</div>
          <div className="flex gap-2">
            <a href="#" className="p-2 rounded-lg c-fill"><MessageCircle size={15}/></a>
            <a href="#" className="p-2 rounded-lg c-fill"><Instagram size={15}/></a>
            <a href="#" className="p-2 rounded-lg c-fill"><TrendingUp size={15}/></a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-8 c-fs-11 c-text-dim3 leading-6 border-t c-border-line pt-5">
        ⚠️ متجر بطاطا منصة مستقلة لبيع حسابات جاهزة، وغير تابعة لأي جهة أو شركة خارجية.
      </div>
    </footer>
  );
}

/* ============================= App ============================= */
export default function BatataStore() {
  const [page, setPage] = useState("home");
  const [params, setParams] = useState({});
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [reviews, setReviews] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // orders placed THIS session (guest-friendly, no account needed)
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState("dark");

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      try { window.localStorage.setItem("batata:theme", next); } catch {}
      return next;
    });
  }, []);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2200);
  }, []);

  async function refreshProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data.map(dbToProduct));
  }
  async function refreshCategories() {
    const { data } = await supabase.from("categories").select("*");
    if (data && data.length) setCategories(data);
  }
  async function refreshReviews() {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(9);
    if (data) setReviews(data);
  }

  // load persisted data + supabase session
  useEffect(() => {
    (async () => {
      try {
        const storedTheme = window.localStorage.getItem("batata:theme");
        if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
      } catch {}

      await Promise.all([refreshProducts(), refreshCategories(), refreshReviews()]);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ name: session.user.email, isAdmin: true });
      }
      setLoaded(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser({ name: session.user.email, isAdmin: true });
      else setUser(u => (u && u.isAdmin ? null : u));
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const go = useCallback((p, extraParams) => {
    setPage(p);
    setParams(extraParams || {});
    window.scrollTo?.(0, 0);
  }, []);

  function addToCart(product, qty) {
    setCart(prev => {
      const existing = prev.find(c => c.productId === product.id);
      if (existing) return prev.map(c => c.productId === product.id ? { ...c, qty: c.qty + qty } : c);
      return [...prev, { productId: product.id, qty }];
    });
    addToast(`تمت إضافة ${product.name} للسلة 🥔`);
  }
  function updateQty(productId, qty) {
    if (qty <= 0) { setCart(prev => prev.filter(c => c.productId !== productId)); return; }
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, qty } : c));
  }
  function removeFromCart(productId) { setCart(prev => prev.filter(c => c.productId !== productId)); addToast("تم حذف المنتج من السلة"); }

  // تسجيل دخول: نحاول الدخول كأدمن حقيقي عبر Supabase Auth، وإذا فشل نعتبره زائر (بدون حساب حقيقي، للتسوق فقط)
  async function login(emailOrPhone, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailOrPhone, password: password || "" });
    if (!error && data?.user) {
      setUser({ name: data.user.email, isAdmin: true });
      addToast("أهلاً بك أيها الأدمن 👑");
      go("admin");
      return;
    }
    setUser({ name: emailOrPhone, isAdmin: false });
    addToast("تم تسجيل الدخول بنجاح ✓");
    go("home");
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    addToast("تم تسجيل الخروج");
    go("home");
  }

  async function placeOrder(items, total, gameId, email) {
    const id = String(Date.now()).slice(-6);
    const dbItems = items.map(i => ({ productId: i.productId, qty: i.qty, product: i.product }));
    const { error } = await supabase.from("orders").insert({ id, items: dbItems, total, game_id: gameId, email, status: "قيد المراجعة" });
    if (error) { addToast("تعذّر إرسال الطلب، حاول مرة ثانية", "error"); return; }
    const order = { id, items, total, gameId, email, status: "قيد المراجعة", date: Date.now() };
    setOrders(prev => [...prev, order]);
    setCart([]);
    addToast("تم إرسال طلبك بنجاح ✓ رقم الطلب #" + id);
    go("orders");
  }

  async function submitReview(orderId, customerName, rating, text) {
    const { error } = await supabase.from("reviews").insert({ order_id: orderId, customer_name: customerName, rating, text });
    if (error) { addToast("تعذّر إرسال المراجعة", "error"); return false; }
    addToast("شكرًا لك! تم نشر مراجعتك ✓");
    refreshReviews();
    return true;
  }

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div dir="rtl" className="min-h-screen c-bg c-text" style={{ fontFamily: "'Tajawal', sans-serif", ...THEMES[theme] }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        ::selection{background:var(--soft-border)}
        /* no global transition on * — it was causing a noticeable lag on theme toggle across many elements */

        /* backgrounds */
        .c-bg{background-color:var(--bg)}
        .c-bg90{background-color:var(--bg-90)}
        .c-bg75{background-color:color-mix(in srgb, var(--bg) 75%, transparent)}
        .c-surface{background-color:var(--surface)}
        .c-surface2{background-color:var(--surface2)}
        .c-soft-bg{background-color:var(--soft-bg)}
        .c-fill{background-color:var(--fill)}
        .c-fill-strong{background-color:var(--fill-strong)}
        .c-bg-text{background-color:var(--text)}
        .c-grad-surface{background-image:linear-gradient(135deg, var(--surface2), var(--surface))}

        /* text colors */
        .c-text{color:var(--text)}
        .c-text-dim{color:var(--text-dim)}
        .c-text-dim2{color:var(--text-dim2)}
        .c-text-dim3{color:var(--text-dim3)}
        .c-text-bg{color:var(--bg)}

        /* borders */
        .c-border-line{border-color:var(--line)}
        .c-border-line-strong{border-color:var(--line-strong)}
        .c-border-soft{border-color:var(--soft-border)}
        .c-border-text{border-color:var(--text)}

        /* hover / focus */
        .c-hover-fill-strong:hover{background-color:var(--fill-strong)}
        .c-hover-text:hover{color:var(--text)}
        .c-hover-border-soft:hover{border-color:var(--soft-border)}
        .c-focus-border-text:focus{border-color:var(--text)}
        .c-placeholder-dim3::placeholder{color:var(--text-dim3)}

        /* svg / form accents */
        .c-fill-text{fill:var(--text)}
        .c-accent-text{accent-color:var(--text)}

        /* misc arbitrary sizes / effects */
        .c-fs-10{font-size:10px}
        .c-fs-10-5{font-size:10.5px}
        .c-fs-11{font-size:11px}
        .c-fs-12{font-size:12px}
        .c-fs-12-5{font-size:12.5px}
        .c-fs-13-5{font-size:13.5px}
        .c-fs-15{font-size:15px}
        .c-z-100{z-index:100}
        .c-opacity-08{opacity:.08}
        .c-minh-36{min-height:36px}
        .c-anim-fadein{animation:fadeIn .2s ease}
      `}</style>

      <Toasts toasts={toasts} />
      <Header page={page} go={go} cartCount={cartCount} user={user} onOpenMenu={() => setMenuOpen(true)} theme={theme} toggleTheme={toggleTheme} />
      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} go={go} user={user} />

      <main>
        {page === "home" && <HomePage products={products} categories={categories} reviews={reviews} go={go} addToCart={addToCart} />}
        {page === "shop" && <ShopPage products={products} categories={categories} go={go} addToCart={addToCart} initialFilters={params} />}
        {page === "product" && <ProductPage products={products} id={params.id} go={go} addToCart={addToCart} />}
        {page === "cart" && <CartPage cart={cart} products={products} updateQty={updateQty} removeFromCart={removeFromCart} go={go} />}
        {page === "checkout" && <CheckoutPage cart={cart} products={products} placeOrder={placeOrder} go={go} user={user} />}
        {page === "orders" && <OrdersPage orders={orders} go={go} submitReview={submitReview} />}
        {page === "login" && <LoginPage login={login} go={go} />}
        {page === "faq" && <FaqPage />}
        {page === "contact" && <ContactPage go={go} />}
        {page === "terms" && <TermsPage />}
        {page === "privacy" && <PrivacyPage />}
        {page === "refund" && <RefundPage />}
        {page === "admin" && (user?.isAdmin
          ? <AdminPage products={products} categories={categories} refreshProducts={refreshProducts} refreshCategories={refreshCategories} addToast={addToast} logout={logout} userEmail={user.name} />
          : <div className="max-w-md mx-auto px-4 py-24 text-center c-text-dim2">هذه الصفحة خاصة بالأدمن فقط.</div>)}
      </main>

      <Footer go={go} />
    </div>
  );
}
