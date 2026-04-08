import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bakım Modu | DIO Implant",
  description: "Sitemiz kısa süreli bakım çalışması nedeniyle geçici olarak kapalıdır.",
};

export default function MaintenancePage() {
  return (
    <>
      <style>{`.header{display:none!important;}`}</style>
      <main
        style={{
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1rem",
          background:
            "radial-gradient(1200px 500px at 90% -10%, rgba(157, 141, 241, 0.2), transparent 60%), radial-gradient(900px 420px at 10% 0%, rgba(78, 76, 176, 0.12), transparent 60%), #f8f7fc",
        }}
      >
        <section
          style={{
            width: "min(680px, 100%)",
            borderRadius: "24px",
            padding: "2rem 1.5rem",
            background: "#fff",
            border: "1px solid rgba(78, 76, 176, 0.14)",
            boxShadow: "0 20px 50px rgba(21, 19, 58, 0.12)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 .5rem",
              fontSize: ".75rem",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#4e4cb0",
            }}
          >
            Geçici Bakım
          </p>
          <h1
            style={{
              margin: "0 0 .75rem",
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              lineHeight: 1.2,
              color: "#1a1833",
            }}
          >
            Sitemiz kısa süreli bakımda
          </h1>
          <p
            style={{
              margin: 0,
              color: "#4a4863",
              lineHeight: 1.65,
              fontSize: "1rem",
            }}
          >
            Altyapı güncellemesi nedeniyle hizmetimize geçici olarak ara verdik.
            Lütfen biraz sonra tekrar deneyin.
          </p>
        </section>
      </main>
    </>
  );
}

