import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "../../../components/common/footer";
import { TrainingCalendarView } from "../../../components/academy/training-calendar-view";
import { TrainingEventGrid } from "../../../components/academy/training-event-grid";
import { getTrainingEventsSorted } from "../../../lib/academy-training-events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eğitim Takvimi | DIO Akademi | DIO Implant",
  description:
    "DIO Akademi eğitim ve seminer takvimi: hands-on kurslar, seminerler ve bölgesel etkinlikler.",
};

export default async function AcademyTrainingCalendarPage() {
  const events = await getTrainingEventsSorted();
  const calendarItems = events.map((e) => ({
    dateISO: e.dateISO,
    slug: e.slug,
    title: e.title,
    venue: e.venue,
    slotStart: e.slotStart,
    slotEnd: e.slotEnd,
  }));

  return (
    <>
      <main className="ac-page">
        <section className="ac-hero" aria-labelledby="ac-hero-title">
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
              <div className="ac-hero-badge">
                <span className="ac-hero-badge-dot" aria-hidden="true" />
                <span>DIO Akademi</span>
              </div>
              <h1 id="ac-hero-title" className="ac-hero-title">
                Eğitim <em>takvimi</em>
              </h1>
              <p className="ac-hero-lead">
                Hands-on kurslar, seminerler ve bölgesel etkinlikler. Yaklaşan
                programları inceleyin; detay ve kayıt için etkinlik sayfasına
                geçin.
              </p>
            </div>
          </div>
        </section>

        <section
          className="ac-section ac-section--alt"
          aria-labelledby="ac-section-title"
        >
          <div className="ac-inner">
            <TrainingEventGrid events={events} />

            <header className="ac-section-head">
              <div className="section-tag">
                <span className="tag-line" />
                <span className="tag-text">Yaklaşan etkinlikler</span>
              </div>
              <h2 id="ac-section-title" className="ac-section-title">
                Yaklaşan <em>etkinlikler</em>
              </h2>
            </header>

            <div className="ac-calendar-wrap">
              <TrainingCalendarView events={calendarItems} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
