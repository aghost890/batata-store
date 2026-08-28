import "./globals.css";

export const metadata = {
  title: "متجر بطاطا | Batata Store",
  description: "متجر بطاطا 🥔 – حسابات جاهزة بمستويات مختلفة، مبتدئين، مميزة، VIP ونخبة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@500;600;700;800&family=Tajawal:wght@400;500;700;900&family=Chakra+Petch:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
