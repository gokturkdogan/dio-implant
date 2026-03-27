import type { Metadata } from "next";
import "./globals.css";
import "./styles/navbar.css";
import "./styles/homepage.css";
import "./styles/footer.css";
import { Navbar } from "../components/common/navbar";

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
    <html lang="tr">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
