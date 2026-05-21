import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/common/footer";
import { ContactInquiryForm } from "@/components/contact/contact-inquiry-form";

export const metadata: Metadata = {
  title: "Bize Ulaşın | DIO Implant",
  description:
    "DIO Implant ile iletişime geçin. Sorularınız ve talepleriniz için formu doldurun; ekibimiz size en kısa sürede dönüş yapsın.",
};

export default function BizeUlasinPage() {
  return (
    <>
      <main className="ct-page">
        <section className="ct-hero ct-hero--compact">
          <div className="ct-hero-inner">
            <div className="ct-hero-copy">
              <p className="ct-eyebrow">Bize Ulaşın</p>
              <h1>
                Sorularınız için <em>buradayız</em>
              </h1>
              <p>
                Ürünler, eğitimler veya iş birliği hakkında mesajınızı iletin; size
                e-posta ile dönüş yapalım.
              </p>
            </div>
          </div>
        </section>

        <section className="ct-section ct-inquiry-section" aria-labelledby="ct-inquiry-title">
          <div className="ct-inner">
            <div className="ct-inquiry-layout">
              <div className="ct-inquiry-aside">
                <div className="section-tag">
                  <span className="tag-line" />
                  <span className="tag-text">İletişim formu</span>
                </div>
                <h2 id="ct-inquiry-title" className="ct-section-title">
                  Mesajınızı <em>gönderin</em>
                </h2>
                <p className="ct-section-lead">
                  E-posta adresinizi ve mesajınızı paylaşın. Form gönderildiğinde
                  ekibimize bildirim gider; yanıtlarınızı belirttiğiniz adrese iletiriz.
                </p>
                <ul className="ct-inquiry-notes">
                  <li>Genellikle 1–2 iş günü içinde dönüş yapılır.</li>
                  <li>
                    Acil bayi veya bölge bilgisi için{" "}
                    <Link href="/iletisim">İletişim sayfası</Link>ndaki haritayı
                    kullanabilirsiniz.
                  </li>
                </ul>
              </div>

              <div className="ct-inquiry-card">
                <ContactInquiryForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
