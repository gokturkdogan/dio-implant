import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../../../components/common/footer";
import {
  ACADEMY_EVENT_POSTER_URL,
  ACADEMY_SPEAKER_PHOTO_URL,
  getTrainingBySlug,
} from "../../../../lib/academy-training-events";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getTrainingBySlug(slug);
  if (!ev) return { title: "Etkinlik | DIO Implant" };
  return {
    title: `${ev.title} | Eğitim Takvimi | DIO Implant`,
    description: ev.excerpt,
  };
}

export default async function AcademyTrainingDetailPage({ params }: Props) {
  const { slug } = await params;
  const ev = await getTrainingBySlug(slug);
  if (!ev) notFound();

  const speakers = ev.speakers ?? [];
  const curriculum = ev.curriculum ?? [];

  return (
    <>
      <main className="acd-page">
        {/* ── Hero (eski panorama hero) ── */}
        <section className="ac-hero" aria-labelledby="acd-hero-title">
          <div className="ac-hero-bg" aria-hidden="true">
            <Image
              src="https://res.cloudinary.com/drjz8v617/image/upload/seminars-banner.webp"
              alt=""
              fill
              className="ac-hero-bg-img"
              sizes="100vw"
              priority
            />
          </div>
          <div className="ac-hero-overlay" aria-hidden="true" />
          <div className="ac-inner ac-hero-grid">
            <div>
              <p className="ac-hero-lead" style={{ marginBottom: "0.5rem", opacity: 0.95 }}>
                {ev.format} · {ev.city}
              </p>
              <h1 id="acd-hero-title" className="ac-hero-title">
                {ev.title}
              </h1>
            </div>
          </div>
        </section>

        {/* ── Poster + bilgi kartları ── */}
        <section className="acd-content-section">
          <div className="ac-inner acd-content-grid">
            <div className="acd-poster-col">
              <div className="acd-poster-frame">
                <Image
                  src={ev.posterUrl ?? ACADEMY_EVENT_POSTER_URL}
                  alt={`${ev.title} poster`}
                  width={520}
                  height={720}
                  className="acd-poster-img"
                  sizes="(max-width: 900px) 100vw, 440px"
                />
              </div>
            </div>
            <div className="acd-body-col">
              <span className="acd-hero-chip">{ev.format}</span>
              <h2 className="acd-body-title">{ev.title}</h2>
              <p className="acd-body-excerpt">{ev.excerpt}</p>

              <div className="acd-detail-list">
                <div className="acd-detail-row">
                  <IconCalendar />
                  <div>
                    <span className="acd-detail-row-label">Tarih & Saat</span>
                    <span className="acd-detail-row-value">
                      {ev.dateDisplay}
                      {ev.timeRange ? ` · ${ev.timeRange}` : ""}
                    </span>
                  </div>
                </div>
                <div className="acd-detail-row">
                  <IconPin />
                  <div>
                    <span className="acd-detail-row-label">Yer</span>
                    <span className="acd-detail-row-value">
                      {ev.venue}, {ev.city}
                      {ev.venueAddress ? (
                        <span className="acd-detail-row-address">{ev.venueAddress}</span>
                      ) : null}
                    </span>
                  </div>
                </div>
                {ev.instructors.length > 0 ? (
                  <div className="acd-detail-row">
                    <IconUser />
                    <div>
                      <span className="acd-detail-row-label">Eğitmen</span>
                      <span className="acd-detail-row-value">
                        {ev.instructors.join(", ")}
                      </span>
                    </div>
                  </div>
                ) : null}
                <div className="acd-detail-row">
                  <IconFormat />
                  <div>
                    <span className="acd-detail-row-label">Format</span>
                    <span className="acd-detail-row-value">{ev.format}</span>
                  </div>
                </div>
              </div>

              {ev.highlights && ev.highlights.length > 0 && (
                <div className="acd-highlights">
                  <h3>Kısa özet</h3>
                  <ul className="acd-highlights__list">
                    {ev.highlights.map((h, i) => (
                      <li key={i} className="acd-highlights__item">
                        <svg
                          className="acd-highlights__dot"
                          width="8"
                          height="8"
                          viewBox="0 0 8 8"
                          aria-hidden="true"
                        >
                          <circle cx="4" cy="4" r="3" fill="currentColor" />
                        </svg>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="acd-cta-card">
                <h3>Kayıt & Bilgi</h3>
                <p>
                  Kontenjan ve koşullar için DIO Türkiye eğitim ekibi ile
                  iletişime geçin.
                </p>
                <a href="#" className="acd-cta-btn">
                  Bilgi talep et
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Speakers ── */}
        {speakers.length > 0 && (
          <section className="acd-speakers-section" aria-labelledby="acd-speakers-title">
            <div className="ac-inner">
              <div className="acd-section-tag">
                <span className="acd-section-tag-line" />
                <span className="acd-section-tag-text">Konuşmacılar</span>
              </div>
              <h2 id="acd-speakers-title" className="acd-section-heading">
                Eğitmenler & <em>Konuşmacılar</em>
              </h2>
              <div className="acd-speakers-grid">
                {speakers.map((sp, idx) => (
                  <div key={idx} className="acd-speaker-card">
                    <div className="acd-speaker-photo-wrap">
                      <Image
                        src={sp.photoUrl ?? ACADEMY_SPEAKER_PHOTO_URL}
                        alt={sp.name}
                        width={220}
                        height={220}
                        className="acd-speaker-photo"
                        unoptimized={Boolean(sp.photoUrl)}
                      />
                    </div>
                    <div className="acd-speaker-body">
                      <h3 className="acd-speaker-name">{sp.name}</h3>
                      {sp.education.length > 0 ? (
                        <div className="acd-speaker-meta">
                          {sp.education.map((line, i) => (
                            <div key={`edu-${idx}-${i}`} className="acd-speaker-meta-row">
                              <IconGrad />
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {sp.specialties.length > 0 ? (
                        <div className="acd-speaker-meta">
                          {sp.specialties.map((line, i) => (
                            <div key={`sp-${idx}-${i}`} className="acd-speaker-meta-row">
                              <IconStar />
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {sp.bio ? <p className="acd-speaker-bio">{sp.bio}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Curriculum ── */}
        {curriculum.length > 0 && (
          <section className="acd-curriculum-section" aria-labelledby="acd-curriculum-title">
            <div className="ac-inner">
              <div className="acd-section-tag">
                <span className="acd-section-tag-line" />
                <span className="acd-section-tag-text">Müfredat</span>
              </div>
              <h2 id="acd-curriculum-title" className="acd-section-heading">
                Günün <em>Programı</em>
              </h2>
              <div className="acd-curriculum-timeline">
                {curriculum.map((item, idx) => {
                  const isBreak =
                    item.topic.startsWith("Ara") ||
                    item.topic.startsWith("Öğle") ||
                    item.topic.startsWith("Kayıt");
                  return (
                    <div
                      key={idx}
                      className={`acd-curriculum-item${isBreak ? " acd-curriculum-item--break" : ""}`}
                    >
                      <div className="acd-curriculum-time">
                        <span className="acd-curriculum-dot" aria-hidden="true" />
                        <span>{item.time}</span>
                      </div>
                      <div className="acd-curriculum-content">
                        <span className="acd-curriculum-topic">{item.topic}</span>
                        {item.speaker && (
                          <span className="acd-curriculum-speaker">{item.speaker}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Back ── */}
        <div className="acd-back-section">
          <div className="ac-inner">
            <Link href="/dio-akademi/egitim-takvimi" className="acd-back-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Tüm etkinliklere dön
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function IconCalendar() {
  return (
    <svg className="acd-detail-row-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg className="acd-detail-row-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="acd-detail-row-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconFormat() {
  return (
    <svg className="acd-detail-row-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconGrad() {
  return (
    <svg className="acd-speaker-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10l-10-6L2 10l10 6 10-6z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg className="acd-speaker-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
    </svg>
  );
}
