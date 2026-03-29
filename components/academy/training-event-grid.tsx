import Image from "next/image";
import Link from "next/link";
import {
  ACADEMY_EVENT_GRID_COVER_URL,
  getTrainingCardDateParts,
} from "@/lib/academy-training-events";
import type { TrainingEvent, TrainingFormat } from "@/lib/training-events-types";

type Props = {
  events: TrainingEvent[];
};

function badgeModifier(format: TrainingFormat): string {
  switch (format) {
    case "Hands-on":
      return "ac-event-card__badge--hands";
    case "Seminer":
      return "ac-event-card__badge--seminer";
    default:
      return "ac-event-card__badge--mixed";
  }
}

function coverDateLine(dateISO: string): string {
  const [y, , d] = dateISO.split("-").map(Number);
  const { monthShort } = getTrainingCardDateParts(dateISO);
  const day = Number.isFinite(d) ? d : 1;
  const year = Number.isFinite(y) ? y : new Date().getFullYear();
  return `${day} ${monthShort} ${year}`;
}

function IconCalendar() {
  return (
    <svg
      className="ac-event-card__detail-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg
      className="ac-event-card__detail-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      className="ac-event-card__detail-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function TrainingEventGrid({ events }: Props) {
  return (
    <ul className="ac-event-grid">
      {events.map((ev) => {
        const dateLine =
          ev.timeRange != null && ev.timeRange.length > 0
            ? `${ev.dateDisplay} · ${ev.timeRange}`
            : ev.dateDisplay;

        return (
          <li key={ev.slug} className="ac-event-grid__cell">
            <Link
              href={`/dio-akademi/egitim-takvimi/${ev.slug}`}
              className="ac-event-card ac-event-card--tile"
            >
              <div className="ac-event-card__cover">
                <Image
                  src={ev.coverUrl ?? ACADEMY_EVENT_GRID_COVER_URL}
                  alt=""
                  fill
                  className="ac-event-card__cover-img"
                  sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="ac-event-card__cover-shade" aria-hidden="true" />
                <div className="ac-event-card__cover-text">
                  <p className="ac-event-card__cover-date">
                    {coverDateLine(ev.dateISO)}
                  </p>
                  <p className="ac-event-card__cover-title">{ev.title}</p>
                </div>
              </div>

              <div className="ac-event-card__body">
                <span
                  className={`ac-event-card__badge ${badgeModifier(ev.format)}`}
                >
                  {ev.format}
                </span>
                <h3 className="ac-event-card__body-title">{ev.title}</h3>
                <ul className="ac-event-card__details">
                  <li className="ac-event-card__detail-row">
                    <IconCalendar />
                    <span>{dateLine}</span>
                  </li>
                  <li className="ac-event-card__detail-row">
                    <IconPin />
                    <span>
                      {ev.city}, Türkiye
                      <span className="ac-event-card__detail-sep"> · </span>
                      {ev.venue}
                    </span>
                  </li>
                  {ev.instructors.length > 0
                    ? ev.instructors.map((name, idx) => (
                        <li
                          key={`${ev.slug}-inst-${idx}`}
                          className="ac-event-card__detail-row"
                        >
                          <IconUser />
                          <span>{name}</span>
                        </li>
                      ))
                    : null}
                </ul>

                {ev.speakers && ev.speakers.length > 0 ? (
                  <div className="ac-event-card__speakers">
                    <ul
                      className="ac-event-card__speakers-list"
                      aria-label="Konuşmacılar"
                    >
                      {ev.speakers.map((sp, idx) => (
                        <li
                          key={`${ev.slug}-sp-${idx}`}
                          className="ac-event-card__speaker-row"
                        >
                          <IconUser />
                          <span className="ac-event-card__speaker-name">
                            {sp.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
