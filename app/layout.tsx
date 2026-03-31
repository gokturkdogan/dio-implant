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
import "./styles/catalog-page.css";
import "./styles/admin-panel.css";
import { NavbarShell } from "../components/common/navbar-shell";
import { NavbarEnhancements } from "../components/common/navbar-enhancements";

export const metadata: Metadata = {
  title: "DIO Implant",
  description: "Clean architecture backend with Next.js + Drizzle + Neon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
        <NavbarShell />
        <NavbarEnhancements />
        {children}
      </body>
    </html>
  );
}
