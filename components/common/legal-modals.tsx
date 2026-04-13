"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import "../../app/styles/legal-modal.css";

export type LegalDocId = "privacy" | "terms" | "cookie";

function formatUpdatedDate() {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function IconCookie() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 00-5-5" />
      <circle cx="8.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconWindow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M3 9h18" />
      <circle cx="6.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function IconChartOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16M9 9v9M15 6v12M21 21H3" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 18a4 4 0 01-2-7.465A6 6 0 1118 16h-1" />
    </svg>
  );
}

function IconScale() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V8l6-4 6 4v13M9 21v-4h6v4" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconServer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <rect x="3" y="14" width="18" height="6" rx="1" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="7" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path strokeLinecap="round" d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

function IconFileText() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path strokeLinecap="round" d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function IconBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 4.9L20 8l-4 3.9.9 5.5L12 15.8 7.1 17.4 8 11.9 4 8l5.6-1.1L12 2z" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path strokeLinecap="round" d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconGavel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 13l-8 8M4 20l2-2M14 3l7 7M9 8l7-7M2 22l4-4" />
    </svg>
  );
}

type SectionProps = { icon: ReactNode; title: string; children: ReactNode };

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="legal-modal__section">
      <div className="legal-modal__icon" aria-hidden>
        {icon}
      </div>
      <div className="legal-modal__section-body">
        <h3 className="legal-modal__section-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function CookiePolicyBody() {
  return (
    <>
      <Section icon={<IconCookie />} title="Çerez nedir?">
        <ul className="legal-modal__list">
          <li>
            Çerezler, ziyaret ettiğiniz site tarafından tarayıcınıza kaydedilebilen küçük metin dosyalarıdır; sayfanın
            düzgün çalışması veya tercihlerin hatırlanması gibi amaçlarla kullanılabilir.
          </li>
          <li>
            Kamuya açık sayfalarımızda reklam veya davranışsal izleme amaçlı çerez kullanılmamaktadır; ayrıntılar
            aşağıdadır.
          </li>
        </ul>
      </Section>
      <Section icon={<IconShield />} title="Ziyaretçi deneyimi ve gerekli kullanım">
        <ul className="legal-modal__list">
          <li>İçerikleri güvenli ve sorunsuz sunabilmek için teknik olarak gerekli minimum düzeyde teknoloji kullanılabilir.</li>
          <li>
            Aşağıda, çerez dışı ancak tarayıcınızda saklanan kısa ömürlü bilgiler de anlatılmaktadır; bunlar sizi tanımlamak
            için kullanılmaz.
          </li>
        </ul>
      </Section>
      <Section icon={<IconWindow />} title="Oturum içi bilgi (çerez değil)">
        <ul className="legal-modal__list">
          <li>
            Bazı sayfalarda, aynı tarayıcı oturumu içinde bilgilendirme içeriğinin tekrar gösterilmemesi için{" "}
            <strong>sessionStorage</strong> kullanılabilir; tarayıcı oturumu sonlandığında silinir.
          </li>
        </ul>
      </Section>
      <Section icon={<IconChartOff />} title="Analitik ve pazarlama">
        <ul className="legal-modal__list">
          <li>Şu an sitede Google Analytics, pazarlama pikselleri veya reklam çerezleri <strong>etkin değildir</strong>.</li>
          <li>İleride eklenmesi halinde bu metin güncellenecek ve gerekirse onay mekanizması sunulacaktır.</li>
        </ul>
      </Section>
      <Section icon={<IconCloud />} title="Üçüncü taraf içerik">
        <ul className="legal-modal__list">
          <li>Görseller gibi bazı içerikler harici CDN üzerinden yüklenebilir; bu sağlayıcıların kendi çerez politikaları geçerli olabilir.</li>
          <li>Harita gömme alanları kullanıldığında harita sağlayıcısının koşulları uygulanabilir.</li>
        </ul>
      </Section>
      <Section icon={<IconScale />} title="Haklarınız ve diğer metinler">
        <ul className="legal-modal__list">
          <li>Kişisel verileriniz için <strong>Gizlilik Politikası</strong> ve KVKK kapsamındaki başvuru yolları geçerlidir.</li>
          <li>Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz; bazı işlevler etkilenebilir.</li>
        </ul>
      </Section>
    </>
  );
}

function PrivacyPolicyBody() {
  return (
    <>
      <Section icon={<IconBuilding />} title="Kapsam ve veri sorumlusu">
        <ul className="legal-modal__list">
          <li>
            Bu metin, DIO Implant web sitesini ziyaret eden kullanıcılar için hazırlanmıştır. Veri sorumlusu unvanı,
            adres ve iletişim bilgileri için sitemizdeki <strong>İletişim</strong> bölümünde yayımlanan ticari işletme
            bilgilerine başvurabilirsiniz.
          </li>
          <li>
            Web sitemiz üzerinden ad, soyad, e-posta gibi kişisel verilerinizi toplayan bir kayıt veya iletişim formu{" "}
            <strong>bulunmamaktadır</strong>. E-posta uygulamanızı açan <strong>mailto:</strong> bağlantıları ile gönderdiğiniz
            mesajlar, kendi e-posta altyapınız ve alıcı tarafındaki süreçlere tabidir.
          </li>
        </ul>
      </Section>
      <Section icon={<IconEye />} title="İşlenen veri türleri (özet)">
        <ul className="legal-modal__list">
          <li>
            <strong>Yayımlanan iletişim verileri:</strong> Genel merkez, bölge müdürlükleri ve yetkili bayi rehberinde
            yer alan ticari iletişim bilgileri (ör. telefon, e-posta, adres) bilgilendirme amacıyla sunulur; ziyaretçiden
            bu bilgileri toplamıyoruz.
          </li>
          <li>
            <strong>Teknik veriler:</strong> Sunucu veya barındırma hizmeti kapsamında bağlantı zamanı, IP adresi, istenen
            sayfa adresi gibi kayıtlar oluşabilir; amaç güvenlik, hata giderme ve yasal yükümlülüklerin yerine getirilmesidir.
          </li>
          <li>
            <strong>Özel nitelikli kişisel veri:</strong> Web sitemiz üzerinden hasta sağlığı verisi veya özel nitelikli veri
            toplamıyoruz.
          </li>
        </ul>
      </Section>
      <Section icon={<IconFileText />} title="İşleme amaçları ve hukuki sebepler">
        <ul className="legal-modal__list">
          <li>Site içeriğinin sunulması, güncellenmesi ve erişilebilir olması.</li>
          <li>Bilgi güvenliği, kötüye kullanımın önlenmesi ve hukuki uyuşmazlıklarda delil oluşturulması.</li>
          <li>Hukuki sebepler, veri niteliğine göre KVKK&apos;nın 5. ve 6. maddelerinde düzenlenen haller kapsamında
            değerlendirilir (ör. kanunlarda açıkça öngörülme, meşru menfaat, hukuki yükümlülük).</li>
        </ul>
      </Section>
      <Section icon={<IconShare />} title="Verilerin aktarılması">
        <ul className="legal-modal__list">
          <li>
            Görseller ve medya dosyaları için harici içerik dağıtım (CDN) hizmetleri kullanılabilir; veri trafiği bu
            sağlayıcıların sunucularına yönlenebilir.
          </li>
          <li>Harita gömme özellikleri kullanıldığında ilgili harita hizmeti sağlayıcısı veri işleyebilir.</li>
          <li>Veri tabanı ve uygulama barındırması için sözleşmeli iş ortakları (bulut / hosting) devreye girebilir.</li>
          <li>Yurt dışına aktarım söz konusu ise KVKK&apos;nın 9. maddesi çerçevesinde gerekli güvenceler sağlanır veya
            metin güncellenir.</li>
        </ul>
      </Section>
      <Section icon={<IconClock />} title="Saklama süresi">
        <ul className="legal-modal__list">
          <li>Sunucu / güvenlik logları, barındırma sağlayıcısının teknik politikalarına ve yasal zamanaşımı sürelerine uygun olarak saklanır.</li>
          <li>Yayımlanan kurumsal içerik, yayından kaldırılana dek erişilebilir kalabilir.</li>
        </ul>
      </Section>
      <Section icon={<IconScale />} title="Haklarınız">
        <ul className="legal-modal__list">
          <li>KVKK&apos;nın 11. maddesi uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme, itiraz ve
            şikayet hakkı dahil taleplerinizi veri sorumlusuna iletebilirsiniz.</li>
          <li>Çerez ve benzeri teknolojiler için ayrıca <strong>Çerez Politikası</strong>na bakınız.</li>
        </ul>
      </Section>
      <Section icon={<IconMail />} title="Başvuru">
        <ul className="legal-modal__list">
          <li>Başvurularınızı İletişim sayfasındaki kanallar üzerinden iletebilirsiniz. Başvuru usulü için ayrıca
            başvuru formu veya KEP adresi kullanılıyorsa ileride bu metin güncellenecektir.</li>
        </ul>
      </Section>
    </>
  );
}

function TermsOfUseBody() {
  return (
    <>
      <Section icon={<IconFileText />} title="Kabul ve kapsam">
        <ul className="legal-modal__list">
          <li>Bu web sitesine erişerek ve içeriği kullanarak aşağıdaki koşulları okuduğunuzu ve bunlara uyacağınızı kabul etmiş sayılırsınız.</li>
          <li>Koşullar değiştirilebilir; güncel metin sitede yayımlandığı tarihte geçerlidir.</li>
        </ul>
      </Section>
      <Section icon={<IconShield />} title="Hizmetin niteliği">
        <ul className="legal-modal__list">
          <li>Site, ürünler, kataloglar, akademi etkinlikleri ve kurumsal bilgiler genel bilgilendirme amaçlıdır.</li>
          <li>İçerik önceden haber verilmeksizin güncellenebilir veya kaldırılabilir; teknik bakım nedeniyle geçici kesintiler olabilir.</li>
        </ul>
      </Section>
      <Section icon={<IconBadge />} title="Fikri mülkiyet">
        <ul className="legal-modal__list">
          <li>Metinler, görseller, logolar, tasarım unsurları ve yazılım düzenleri ilgili mevzuat kapsamında korunur.</li>
          <li>İzinsiz çoğaltma, dağıtma, ticari kullanım veya tersine mühendislik yasaktır; aksi yazılı izin gerekir.</li>
        </ul>
      </Section>
      <Section icon={<IconEye />} title="İzin verilen kullanım">
        <ul className="legal-modal__list">
          <li>İçeriği kişisel ve ticari olmayan bilgilendirme amacıyla görüntüleyebilir, yasal çerçevede alıntı yapabilirsiniz.</li>
          <li>PDF ve diğer indirilebilir dokümanlar, yalnızca yetkili profesyonel bilgilendirme ve tanıtım amacıyla kullanılmalıdır; tersi kullanım yasaktır.</li>
        </ul>
      </Section>
      <Section icon={<IconAlert />} title="Tıbbi ve profesyonel uyarı">
        <ul className="legal-modal__list">
          <li>
            Sitedeki bilgiler <strong>tıbbi teşhis veya tedavi tavsiyesi</strong> niteliğinde değildir. İmplant ve cerrahi
            uygulamalar yalnızca yetkili hekim değerlendirmesi ile yapılmalıdır.
          </li>
        </ul>
      </Section>
      <Section icon={<IconLink />} title="Üçüncü taraf bağlantılar">
        <ul className="legal-modal__list">
          <li>Dış web sitelerine bağlantılar bilgilendirme amaçlıdır; bu sitelerin içeriği ve gizlilik uygulamalarından sorumlu değiliz.</li>
        </ul>
      </Section>
      <Section icon={<IconScale />} title="Sorumluluk">
        <ul className="legal-modal__list">
          <li>Site &quot;olduğu gibi&quot; sunulur; içeriğin eksiksizliği veya belirli bir amaca uygunluğu konusunda mevzuatın izin verdiği ölçüde sorumluluk sınırlanabilir.</li>
          <li>Üçüncü taraf hizmet kesintileri veya mücbir sebeplerden doğan zararlardan, yasal olarak mümkün olan sınırlar dahilinde sorumluluk kabul edilmez.</li>
        </ul>
      </Section>
      <Section icon={<IconGavel />} title="Uygulanacak hukuk ve yetki">
        <ul className="legal-modal__list">
          <li>Uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır; yetkili mahkeme ve icra daireleri için yasal düzenlemeler saklıdır.</li>
        </ul>
      </Section>
    </>
  );
}

const DOC_CONFIG: Record<
  LegalDocId,
  { title: string; subtitle: string; closeLabel: string }
> = {
  cookie: {
    title: "Çerez Politikası",
    subtitle: "Ziyaretçilerimiz için çerez ve benzeri teknolojilerin kullanımını özetler.",
    closeLabel: "Çerez politikasını kapat",
  },
  privacy: {
    title: "Gizlilik Politikası",
    subtitle: "KVKK kapsamında kişisel verilerin işlenmesine ilişkin bilgilendirme metnidir.",
    closeLabel: "Gizlilik politikasını kapat",
  },
  terms: {
    title: "Kullanım Koşulları",
    subtitle: "Bu web sitesinin kullanımına ilişkin kuralları ve sınırları açıklar.",
    closeLabel: "Kullanım koşullarını kapat",
  },
};

function LegalModalBody({ doc }: { doc: LegalDocId }) {
  switch (doc) {
    case "cookie":
      return <CookiePolicyBody />;
    case "privacy":
      return <PrivacyPolicyBody />;
    case "terms":
      return <TermsOfUseBody />;
    default:
      return null;
  }
}

export function LegalModal({
  doc,
  open,
  onClose,
}: {
  doc: LegalDocId | null;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open || !doc) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, doc, onKeyDown]);

  if (!open || !doc) return null;

  const cfg = DOC_CONFIG[doc];

  return (
    <div className="legal-modal" role="presentation">
      <button type="button" className="legal-modal__backdrop" aria-label="Kapat" onClick={onClose} />
      <div className="legal-modal__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="legal-modal__head">
          <h2 id={titleId} className="legal-modal__title">
            {cfg.title}
          </h2>
          <p className="legal-modal__subtitle">{cfg.subtitle}</p>
          <button ref={closeRef} type="button" className="legal-modal__close" onClick={onClose} aria-label={cfg.closeLabel}>
            <IconClose />
          </button>
        </header>

        <div className="legal-modal__body">
          <LegalModalBody doc={doc} />
        </div>

        <footer className="legal-modal__foot">
          Bu metinler bilgilendirme amaçlıdır; hukuki danışmanlık yerine geçmez. Yerel mevzuata uyum için hukuk
          danışmanlığı alınması önerilir. Son güncelleme: {formatUpdatedDate()}.
        </footer>
      </div>
    </div>
  );
}

export function FooterLegalLinks() {
  const [active, setActive] = useState<LegalDocId | null>(null);

  return (
    <>
      <div className="footer-legal">
        <button type="button" className="footer-legal__modal-trigger" onClick={() => setActive("privacy")}>
          Gizlilik Politikası
        </button>
        <button type="button" className="footer-legal__modal-trigger" onClick={() => setActive("terms")}>
          Kullanım Koşulları
        </button>
        <button type="button" className="footer-legal__modal-trigger" onClick={() => setActive("cookie")}>
          Çerez Politikası
        </button>
      </div>
      <LegalModal doc={active} open={active !== null} onClose={() => setActive(null)} />
    </>
  );
}
