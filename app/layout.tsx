import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  ADMIN_THEME_COOKIE_NAME,
  parseAdminThemeCookie,
} from "../lib/admin-theme";
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
import { NavbarShell } from "../components/common/navbar-shell";
import { NavbarEnhancements } from "../components/common/navbar-enhancements";

const FAVICON_PNG =
  "https://res.cloudinary.com/drjz8v617/image/upload/w_32,h_32,c_pad,f_png,q_auto/dio-logo-dark.webp";

export const metadata: Metadata = {
  title: "DIO Implant",
  description: "Clean architecture backend with Next.js + Drizzle + Neon",
  icons: {
    icon: [{ url: FAVICON_PNG, type: "image/png" }],
    shortcut: FAVICON_PNG,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const ssrAdminTheme = parseAdminThemeCookie(
    cookieStore.get(ADMIN_THEME_COOKIE_NAME)?.value,
  );

  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      {...(ssrAdminTheme ? { "data-admin-theme": ssrAdminTheme } : {})}
      suppressHydrationWarning
    >
      <body>
        <NavbarShell />
        <NavbarEnhancements />
        {children}
      </body>
    </html>
  );
}
