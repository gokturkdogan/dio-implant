"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  dateFnsLocalizer,
  type Components,
  type EventProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { tr } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { TrainingCalendarToolbar } from "./training-calendar-toolbar";

const locales = { tr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type TrainingCalendarItem = {
  dateISO: string;
  slug: string;
  title: string;
  venue: string;
  slotStart: string;
  slotEnd: string;
};

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: { slug: string; venue: string };
};

function combineDateTime(dateISO: string, time: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}

const TR_MESSAGES = {
  date: "Tarih",
  time: "Saat",
  event: "Etkinlik",
  allDay: "Tüm gün",
  week: "Hafta",
  work_week: "İş haftası",
  day: "Gün",
  month: "Ay",
  previous: "Önceki",
  next: "Sonraki",
  yesterday: "Dün",
  tomorrow: "Yarın",
  today: "Bugün",
  agenda: "Ajanda",
  noEventsInRange: "Bu hafta görüntülenecek etkinlik yok.",
  showMore: (n: number) => `+${n} daha`,
};

function EventBlock({ event }: EventProps<CalendarEvent>) {
  return (
    <div className="ac-rbc-event-inner">
      <span className="ac-rbc-event-title">{event.title}</span>
      <span className="ac-rbc-event-sub">{event.resource.venue}</span>
    </div>
  );
}

type Props = {
  events: TrainingCalendarItem[];
};

export function TrainingCalendarView({ events }: Props) {
  const router = useRouter();

  const rbcEvents = useMemo<CalendarEvent[]>(
    () =>
      events.map((ev) => ({
        title: ev.title,
        start: combineDateTime(ev.dateISO, ev.slotStart),
        end: combineDateTime(ev.dateISO, ev.slotEnd),
        resource: { slug: ev.slug, venue: ev.venue },
      })),
    [events],
  );

  const initialDate = useMemo(() => {
    if (!events.length) return new Date();
    return combineDateTime(events[0].dateISO, "12:00");
  }, [events]);

  const [calDate, setCalDate] = useState(initialDate);

  const onSelectEvent = useCallback(
    (event: CalendarEvent) => {
      router.push(`/dio-akademi/egitim-takvimi/${event.resource.slug}`);
    },
    [router],
  );

  const components = useMemo<Components<CalendarEvent>>(
    () => ({
      event: EventBlock,
      toolbar: TrainingCalendarToolbar,
    }),
    [],
  );

  const minT = useMemo(() => new Date(1970, 0, 1, 8, 0, 0), []);
  const maxT = useMemo(() => new Date(1970, 0, 1, 18, 0, 0), []);

  return (
    <div className="ac-week-calendar">
      <Calendar<CalendarEvent>
        localizer={localizer}
        culture="tr"
        messages={TR_MESSAGES}
        events={rbcEvents}
        startAccessor="start"
        endAccessor="end"
        view="week"
        views={["week"]}
        date={calDate}
        onNavigate={setCalDate}
        onSelectEvent={onSelectEvent}
        components={components}
        step={30}
        timeslots={2}
        min={minT}
        max={maxT}
        scrollToTime={minT}
        showMultiDayTimes
        style={{ height: 580 }}
      />
      <p className="ac-calendar-hint ac-calendar-hint--week">
        Etkinlik kutusuna tıklayarak detay sayfasına gidebilirsiniz. Haftayı
        üstteki tarih etiketine veya oklarla değiştirebilirsiniz.
      </p>
    </div>
  );
}
