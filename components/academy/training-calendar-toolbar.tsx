"use client";

import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Navigate, type ToolbarProps } from "react-big-calendar";
import type { CalendarEvent } from "./training-calendar-view";

const TR_MONTH_SHORT = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
] as const;

function isoWeekKey(d: Date): string {
  const s = startOfWeek(d, { locale: tr });
  return format(s, "yyyy-MM-dd");
}

type PanelProps = {
  anchorDate: Date;
  onPickDate: (d: Date) => void;
  onToday: () => void;
};

function TrainingDatePickerPanel({
  anchorDate,
  onPickDate,
  onToday,
}: PanelProps) {
  const [focus, setFocus] = useState(() => startOfMonth(anchorDate));

  useEffect(() => {
    setFocus(startOfMonth(anchorDate));
  }, [anchorDate]);

  const monthStart = startOfMonth(focus);
  const monthEnd = endOfMonth(focus);
  const gridStart = startOfWeek(monthStart, { locale: tr });
  const gridEnd = endOfWeek(monthEnd, { locale: tr });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const activeWeekKey = isoWeekKey(anchorDate);
  const year = focus.getFullYear();

  const rows: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    rows.push(days.slice(i, i + 7));
  }

  return (
    <div
      className="ac-date-picker-popover"
      role="dialog"
      aria-label="Tarih seçici"
    >
      <div className="ac-date-picker-popover__left">
        <div className="ac-date-picker-popover__left-head">
          <span className="ac-date-picker-popover__month-label">
            {format(focus, "LLLL yyyy", { locale: tr })}
          </span>
          <div className="ac-date-picker-popover__steppers">
            <button
              type="button"
              className="ac-date-picker-icon-btn"
              aria-label="Önceki ay"
              onClick={() => setFocus(addMonths(focus, -1))}
            >
              <ChevronUpIcon />
            </button>
            <button
              type="button"
              className="ac-date-picker-icon-btn"
              aria-label="Sonraki ay"
              onClick={() => setFocus(addMonths(focus, 1))}
            >
              <ChevronDownIcon />
            </button>
          </div>
        </div>
        <div className="ac-date-picker-popover__weekdays" aria-hidden="true">
          {rows[0]?.map((d) => (
            <span key={d.toISOString()} className="ac-date-picker-popover__wd">
              {format(d, "EEEEE", { locale: tr })}
            </span>
          ))}
        </div>
        <div className="ac-date-picker-popover__days">
          {rows.map((week) => {
            const wk = isoWeekKey(week[0] ?? anchorDate);
            const inActiveWeek = wk === activeWeekKey;
            return (
              <div
                key={wk}
                className={`ac-date-picker-popover__week-row${inActiveWeek ? " ac-date-picker-popover__week-row--active" : ""}`}
              >
                {week.map((day) => {
                  const muted = !isSameMonth(day, focus);
                  const selected = isSameDay(day, anchorDate);
                  const today = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      className={`ac-date-picker-popover__day${muted ? " ac-date-picker-popover__day--muted" : ""}${selected ? " ac-date-picker-popover__day--selected" : ""}${today && !selected ? " ac-date-picker-popover__day--today-ring" : ""}`}
                      onClick={() => onPickDate(day)}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="ac-date-picker-popover__divider"
        aria-hidden="true"
      />

      <div className="ac-date-picker-popover__right">
        <div className="ac-date-picker-popover__right-head">
          <span className="ac-date-picker-popover__year-label">{year}</span>
          <div className="ac-date-picker-popover__steppers">
            <button
              type="button"
              className="ac-date-picker-icon-btn"
              aria-label="Önceki yıl"
              onClick={() => setFocus(addYears(focus, -1))}
            >
              <ChevronUpIcon />
            </button>
            <button
              type="button"
              className="ac-date-picker-icon-btn"
              aria-label="Sonraki yıl"
              onClick={() => setFocus(addYears(focus, 1))}
            >
              <ChevronDownIcon />
            </button>
          </div>
        </div>
        <div className="ac-date-picker-popover__months">
          {TR_MONTH_SHORT.map((label, i) => {
            const active = getMonth(focus) === i;
            return (
              <button
                key={label}
                type="button"
                className={`ac-date-picker-popover__month-cell${active ? " ac-date-picker-popover__month-cell--active" : ""}`}
                onClick={() => setFocus(new Date(year, i, 1))}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="ac-date-picker-popover__footer">
          <button
            type="button"
            className="ac-date-picker-today-btn"
            onClick={onToday}
          >
            Bugün
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      className="ac-date-picker-chevron"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 14l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="ac-date-picker-chevron"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 10l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaretDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function TrainingCalendarToolbar(props: ToolbarProps<CalendarEvent>) {
  const { label, date, onNavigate, localizer } = props;
  const messages = localizer.messages;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const navigateToday = useCallback(() => {
    onNavigate(Navigate.TODAY);
  }, [onNavigate]);

  const goTodayToolbar = useCallback(() => {
    navigateToday();
    setOpen(false);
  }, [navigateToday]);

  const goPrev = useCallback(() => {
    onNavigate(Navigate.PREVIOUS);
  }, [onNavigate]);

  const goNext = useCallback(() => {
    onNavigate(Navigate.NEXT);
  }, [onNavigate]);

  const pickDate = useCallback((d: Date) => {
    onNavigate(Navigate.DATE, d);
  }, [onNavigate]);

  return (
    <div className="rbc-toolbar ac-rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={goTodayToolbar}>
          {messages.today}
        </button>
        <button type="button" onClick={goPrev}>
          {messages.previous}
        </button>
        <button type="button" onClick={goNext}>
          {messages.next}
        </button>
      </span>

      <div className="ac-toolbar-label-wrap" ref={wrapRef}>
        <button
          type="button"
          className="ac-toolbar-date-trigger"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={open ? labelId : undefined}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="ac-toolbar-date-trigger__text">{label}</span>
          <CaretDownIcon />
        </button>
        {open && (
          <div className="ac-toolbar-date-popover-slot" id={labelId}>
            <TrainingDatePickerPanel
              anchorDate={date}
              onPickDate={pickDate}
              onToday={navigateToday}
            />
          </div>
        )}
      </div>
    </div>
  );
}
