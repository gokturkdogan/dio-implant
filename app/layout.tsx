import type { Metadata } from "next";
import "./globals.css";
import "./styles/navbar.css";
import "./styles/homepage.css";
import "./styles/homepage-popup.css";
import "./styles/footer.css";
import "./styles/dio-navi.css";
import "./styles/dio-fullarch.css";
import "./styles/about.css";
import "./styles/about-timeline.css";
import "./styles/academy-calendar.css";
import "./styles/product-page.css";
import "./styles/products-index.css";
import "./styles/product-carousel.css";
import "./styles/admin-panel.css";
import "./styles/contact.css";

const FAVICON_PNG =
  "https://res.cloudinary.com/drjz8v617/image/upload/w_32,h_32,c_pad,f_png,q_auto/dio-logo-original.webp";

export const metadata: Metadata = {
  title: "DIO Implant",
  description: "Dijital teknolojiyi estetik ve hassasiyetle buluşturan yeni nesil implant çözümleri.",
  icons: {
    icon: [{ url: FAVICON_PNG, type: "image/png" }],
    shortcut: FAVICON_PNG,
    // iOS bu adresi kendiliğinden ister; public/ altında statik dosya olarak sunulur.
    apple: "/apple-touch-icon.png",
  },
};

/**
 * Root layout bilinçli olarak `cookies()` / `headers()` kullanmaz: aksi halde tüm site
 * (public sayfalar dahil) her istekte sunucuda yeniden render edilir. Admin teması
 * `app/admin-panel/layout.tsx` içindeki boot script ile `<html>` üzerine yazılır.
 * Navbar ve bakım modu public sayfalara özeldir: bkz. `app/(site)/layout.tsx`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        {children}
      </body>
    </html>
  );
}
