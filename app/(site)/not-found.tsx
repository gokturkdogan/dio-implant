import type { Metadata } from "next";
import Link from "@/components/common/site-link";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı | DIO Implant",
};

export default function SiteNotFound() {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "160px 24px 80px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "56px",
          fontWeight: 700,
          margin: 0,
          opacity: 0.25,
        }}
      >
        404
      </p>
      <h1 style={{ fontSize: "28px", margin: 0 }}>
        Aradığınız sayfa bulunamadı
      </h1>
      <p style={{ margin: 0, opacity: 0.75, maxWidth: 480 }}>
        Sayfa taşınmış veya kaldırılmış olabilir. Ana sayfadan devam
        edebilirsiniz.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>
        Ana sayfaya dön
      </Link>
    </main>
  );
}
