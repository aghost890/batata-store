import "./globals.css";
import { SITE_URL } from "../lib/site";

const TITLE = "متجر بطاطا | Batata Store";
const DESC = "متجر بطاطا 🥔 – حسابات جاهزة بمستويات مختلفة، مبتدئين، مميزة، VIP ونخبة. تسليم سريع ودفع آمن عبر PayPal.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESC, url: SITE_URL, siteName: "متجر بطاطا", locale: "ar_AR", type: "website" },
  twitter: { card: "summary", title: TITLE, description: DESC },
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
