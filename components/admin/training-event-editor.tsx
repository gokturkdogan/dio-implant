"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import "react-day-picker/style.css";
import { MAX_ADMIN_IMAGE_UPLOAD_MB } from "@/lib/admin-image-upload";
import type {
  CurriculumItem,
  TrainingEvent,
  TrainingFormat,
} from "@/lib/training-events-types";
import { normalizeSpeakers } from "@/lib/speaker-normalize";
import { TURKIYE_ILLERI, TURKIYE_ILLERI_SET } from "@/lib/turkiye-iller";
import { AdminCropImageField } from "./admin-crop-image-field";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";
import { TrainingEventCurriculumField } from "./training-event-curriculum-field";
import {
  TrainingEventSpeakersField,
  type SpeakerWithFile,
} from "./training-event-speakers-field";

const FORMATS: TrainingFormat[] = ["Hands-on", "Seminer", "Teorik + Uygulama"];
const LIST_HREF = "/admin-panel/egitimler";

/* ── SVG icons ── */

function IconGeneral() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 3v18M3 9h18" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-4.35-7-11a7 7 0 1 1 14 0c0 6.65-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconImages() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function IconContent() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`ate-section__chevron ${open ? "ate-section__chevron--open" : ""}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ── helpers ── */

function emptyForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    slug: "",
    title: "",
    coverUrl: "",
    posterUrl: "",
    dateISO: today,
    slotStart: "09:00",
    slotEnd: "17:00",
    timeRange: "09:00 – 17:00",
    city: "",
    venue: "",
    venueAddress: "",
    format: "Seminer" as TrainingFormat,
    excerpt: "",
    highlightsText: "",
    speakers: [] as SpeakerWithFile[],
    curriculum: [] as CurriculumItem[],
  };
}

type FormState = ReturnType<typeof emptyForm>;

function parseDateOnly(iso: string): Date | undefined {
  const s = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return undefined;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return undefined;
  }
  return dt;
}

function displayDateFromISO(iso: string): string {
  const d = parseDateOnly(iso);
  if (!d) throw new Error("Geçerli bir tarih seçin.");
  const datePart = format(d, "d MMMM yyyy", { locale: tr });
  let weekday = format(d, "EEEE", { locale: tr });
  if (weekday) {
    weekday = weekday.charAt(0).toLocaleUpperCase("tr-TR") + weekday.slice(1);
  }
  return `${datePart} · ${weekday}`;
}

function timeRangeFromSlots(slotStart: string, slotEnd: string): string {
  const a = slotStart.trim() || "09:00";
  const b = slotEnd.trim() || "17:00";
  return `${a} – ${b}`;
}

function normalizeTimeForInput(s: string): string {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!m) return "09:00";
  let h = parseInt(m[1], 10);
  let min = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min)) return "09:00";
  h = Math.min(23, Math.max(0, h));
  min = Math.min(59, Math.max(0, min));
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function suggestSlug(title: string, dateISO: string): string {
  const trMap: Record<string, string> = {
    ğ: "g", ü: "u", ş: "s", ı: "i", İ: "i", i: "i",
    ö: "o", ç: "c", â: "a", ê: "e", î: "i", ô: "o", û: "u",
  };
  let s = title
    .toLowerCase()
    .split("")
    .map((c) => trMap[c] ?? c)
    .join("");
  s = s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 72);
  return s ? `${s}-${dateISO}` : `etkinlik-${dateISO}`;
}

function eventToForm(ev: TrainingEvent): FormState {
  return {
    slug: ev.slug,
    title: ev.title,
    coverUrl: ev.coverUrl?.trim() ?? "",
    posterUrl: ev.posterUrl?.trim() ?? "",
    dateISO: ev.dateISO,
    slotStart: normalizeTimeForInput(ev.slotStart),
    slotEnd: normalizeTimeForInput(ev.slotEnd),
    timeRange: ev.timeRange?.trim() || timeRangeFromSlots(ev.slotStart, ev.slotEnd),
    city: ev.city,
    venue: ev.venue,
    venueAddress: ev.venueAddress ?? "",
    format: ev.format,
    excerpt: ev.excerpt,
    highlightsText: (ev.highlights ?? []).join("\n"),
    speakers: normalizeSpeakers(ev.speakers ?? []).map((s) => ({
      ...s,
      _pendingPhotoFile: undefined,
    })),
    curriculum: [...(ev.curriculum ?? [])],
  };
}

function buildEventPayload(
  form: FormState,
  mode: "create" | "edit",
  initialEvent?: TrainingEvent,
): Omit<TrainingEvent, "coverUrl" | "posterUrl"> & {
  coverUrl?: string;
  posterUrl?: string;
} {
  const speakers: TrainingEvent["speakers"] =
    form.speakers.length > 0
      ? form.speakers.map((s) => ({
          name: s.name.trim(),
          photoUrl: s.photoUrl?.startsWith("http") ? s.photoUrl : undefined,
          education: s.education.map((x) => x.trim()).filter(Boolean),
          specialties: s.specialties.map((x) => x.trim()).filter(Boolean),
          bio: s.bio.trim(),
        }))
      : undefined;
  if (speakers?.some((s) => !s.name)) {
    throw new Error("Konuşmacı adı boş olamaz.");
  }

  const curriculum: TrainingEvent["curriculum"] =
    form.curriculum.length > 0
      ? form.curriculum.map((c) => ({
          time: c.time.trim(),
          topic: c.topic.trim(),
          ...(c.speaker?.trim() ? { speaker: c.speaker.trim() } : {}),
        }))
      : undefined;
  if (curriculum?.some((c) => !c.time || !c.topic)) {
    throw new Error("Müfredat bölümlerinde zaman ve açıklama zorunludur.");
  }

  const instructors =
    mode === "edit" && initialEvent ? [...initialEvent.instructors] : [];
  const highlights = form.highlightsText
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const slug = form.slug.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      "Slug yalnızca küçük harf, rakam ve tire içerebilir (ör. dio-navi-egitimi-2025-05-24).",
    );
  }

  return {
    slug,
    title: form.title.trim(),
    dateISO: form.dateISO,
    slotStart: form.slotStart.trim(),
    slotEnd: form.slotEnd.trim(),
    dateDisplay: displayDateFromISO(form.dateISO),
    timeRange:
      form.timeRange.trim() || timeRangeFromSlots(form.slotStart, form.slotEnd) || undefined,
    city: form.city.trim(),
    venue: form.venue.trim(),
    venueAddress: form.venueAddress.trim() || undefined,
    format: form.format,
    instructors,
    excerpt: form.excerpt.trim(),
    highlights: highlights.length ? highlights : undefined,
    speakers,
    curriculum,
  };
}

/* ── Accordion section wrapper ── */

type SectionKey = "general" | "location" | "images" | "content";

function AccordionSection({
  id,
  icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: SectionKey;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: (id: SectionKey) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`ate-section ${open ? "ate-section--open" : ""}`}>
      <button
        type="button"
        className="ate-section__trigger"
        aria-expanded={open}
        aria-controls={`ate-panel-${id}`}
        onClick={() => onToggle(id)}
      >
        <span className="ate-section__icon">{icon}</span>
        <span className="ate-section__label">
          <span className="ate-section__title">{title}</span>
          {subtitle ? <span className="ate-section__subtitle">{subtitle}</span> : null}
        </span>
        <IconChevron open={open} />
      </button>
      {open && (
        <div className="ate-section__panel" id={`ate-panel-${id}`}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Main editor ── */

type Props = {
  mode: "create" | "edit";
  initialEvent?: TrainingEvent;
  originalSlug?: string;
};

export function TrainingEventEditor({ mode, initialEvent, originalSlug }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && initialEvent ? eventToForm(initialEvent) : emptyForm(),
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateFieldRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<AdminToastState>(null);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    general: true,
    location: false,
    images: false,
    content: false,
  });

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const showToast = useCallback((message: string, variant: AdminToastVariant) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ id, message, variant });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  }, []);

  const citySelectOptions = useMemo(() => {
    const c = form.city.trim();
    if (c && !TURKIYE_ILLERI_SET.has(c)) return [c, ...TURKIYE_ILLERI];
    return TURKIYE_ILLERI;
  }, [form.city]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (datePickerOpen) {
        e.preventDefault();
        setDatePickerOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [datePickerOpen]);

  useEffect(() => {
    if (!datePickerOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = dateFieldRef.current;
      if (el && !el.contains(e.target as Node)) setDatePickerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [datePickerOpen]);

  const applySuggestSlug = () => {
    setForm((f) => ({ ...f, slug: suggestSlug(f.title, f.dateISO) }));
  };

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setToast(null);

      let payload: ReturnType<typeof buildEventPayload>;
      try {
        payload = buildEventPayload(form, mode, initialEvent);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Doğrulama hatası", "error");
        return;
      }

      setSaving(true);
      try {
        const fd = new FormData();
        fd.append("event", JSON.stringify(payload));

        if (mode === "edit") {
          fd.append("originalSlug", originalSlug!);
        }

        if (coverFile) fd.append("coverFile", coverFile);
        if (posterFile) fd.append("posterFile", posterFile);

        const hasCoverUrl =
          form.coverUrl.startsWith("http://") || form.coverUrl.startsWith("https://");
        const hasPosterUrl =
          form.posterUrl.startsWith("http://") || form.posterUrl.startsWith("https://");

        if (!coverFile && !hasCoverUrl) fd.append("removeCover", "1");
        if (!posterFile && !hasPosterUrl) fd.append("removePoster", "1");

        form.speakers.forEach((sp, i) => {
          if (sp._pendingPhotoFile) {
            fd.append(`speakerPhoto_${i}`, sp._pendingPhotoFile);
          }
        });

        const method = mode === "create" ? "POST" : "PUT";
        const res = await fetch("/api/admin/trainings", {
          method,
          credentials: "include",
          body: fd,
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            typeof data?.error === "string"
              ? data.error
              : mode === "create"
                ? "Kayıt başarısız"
                : "Güncelleme başarısız";
          showToast(msg, "error");
          return;
        }

        showToast(
          mode === "create" ? "Eğitim oluşturuldu." : "Eğitim güncellendi.",
          "success",
        );
        setTimeout(() => {
          router.push(LIST_HREF);
          router.refresh();
        }, 600);
      } catch {
        showToast("Ağ hatası — lütfen tekrar deneyin.", "error");
      } finally {
        setSaving(false);
      }
    },
    [form, coverFile, posterFile, mode, initialEvent, originalSlug, router, showToast],
  );

  const pageTitle = mode === "create" ? "Yeni eğitim" : "Eğitimi düzenle";

  return (
    <div className="admin-training-editor">
      <div className="admin-training-editor__head">
        <Link href={LIST_HREF} className="admin-training-editor__back">
          ← Eğitim listesine dön
        </Link>
        <h1 className="admin-training-editor__title">{pageTitle}</h1>
      </div>

      <form className="ate-form" onSubmit={onSubmit}>
        {/* ── 1. Genel Bilgiler ── */}
        <AccordionSection
          id="general"
          icon={<IconGeneral />}
          title="Genel bilgiler"
          subtitle="Başlık, slug, tarih, saat ve format"
          open={openSections.general}
          onToggle={toggleSection}
        >
          <div className="ate-grid">
            <label className="admin-field admin-field--full">
              <span>Başlık *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="Etkinlik başlığını girin"
              />
            </label>

            <label className="admin-field admin-field--full">
              <span>Slug *</span>
              <div className="admin-field-row">
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  title="küçük harf, rakam, tire"
                  placeholder="etkinlik-adi-2025-06-01"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary admin-btn--small"
                  onClick={applySuggestSlug}
                >
                  Öner
                </button>
              </div>
            </label>

            <div className="admin-field">
              <span>Tarih *</span>
              <div className="admin-date-field" ref={dateFieldRef}>
                <button
                  type="button"
                  className="admin-date-field__trigger"
                  aria-expanded={datePickerOpen}
                  aria-haspopup="dialog"
                  onClick={() => setDatePickerOpen((o) => !o)}
                >
                  {(() => {
                    const d = parseDateOnly(form.dateISO);
                    return d
                      ? format(d, "d MMMM yyyy, EEEE", { locale: tr })
                      : "Tarih seçin";
                  })()}
                </button>
                {datePickerOpen && (
                  <div className="admin-date-popover" role="dialog" aria-label="Tarih seçin">
                    <DayPicker
                      mode="single"
                      selected={parseDateOnly(form.dateISO)}
                      onSelect={(d) => {
                        if (!d) return;
                        setForm((f) => ({ ...f, dateISO: format(d, "yyyy-MM-dd") }));
                        setDatePickerOpen(false);
                      }}
                      locale={tr}
                      defaultMonth={parseDateOnly(form.dateISO) ?? new Date()}
                    />
                  </div>
                )}
              </div>
            </div>

            <label className="admin-field">
              <span>Format *</span>
              <select
                value={form.format}
                onChange={(e) =>
                  setForm((f) => ({ ...f, format: e.target.value as TrainingFormat }))
                }
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field admin-field--full">
              <span>Saat aralığı *</span>
              <div className="admin-field-row admin-field-row--time-range">
                <input
                  type="time"
                  className="admin-time-input"
                  value={form.slotStart}
                  step={300}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({
                      ...f,
                      slotStart: v,
                      timeRange: timeRangeFromSlots(v, f.slotEnd),
                    }));
                  }}
                  required
                  aria-label="Başlangıç saati"
                />
                <span className="admin-time-range-sep" aria-hidden>–</span>
                <input
                  type="time"
                  className="admin-time-input"
                  value={form.slotEnd}
                  step={300}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({
                      ...f,
                      slotEnd: v,
                      timeRange: timeRangeFromSlots(f.slotStart, v),
                    }));
                  }}
                  required
                  aria-label="Bitiş saati"
                />
              </div>
            </label>
          </div>
        </AccordionSection>

        {/* ── 2. Lokasyon ── */}
        <AccordionSection
          id="location"
          icon={<IconLocation />}
          title="Lokasyon"
          subtitle="Şehir, mekân ve adres"
          open={openSections.location}
          onToggle={toggleSection}
        >
          <div className="ate-grid">
            <label className="admin-field">
              <span>Şehir *</span>
              <select
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                required
              >
                <option value="" disabled>Şehir seçin</option>
                {citySelectOptions.map((il) => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
            </label>

            <label className="admin-field">
              <span>Mekân adı *</span>
              <input
                value={form.venue}
                onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                required
                placeholder="Örn. DIO Türkiye Eğitim Merkezi"
              />
            </label>

            <label className="admin-field admin-field--full">
              <span>Açık adres</span>
              <input
                value={form.venueAddress}
                onChange={(e) => setForm((f) => ({ ...f, venueAddress: e.target.value }))}
                placeholder="Mahalle, cadde, no, ilçe…"
              />
            </label>
          </div>
        </AccordionSection>

        {/* ── 3. Görseller ── */}
        <AccordionSection
          id="images"
          icon={<IconImages />}
          title="Görseller"
          subtitle="Kapak ve afiş görselleri"
          open={openSections.images}
          onToggle={toggleSection}
        >
          <div className="admin-training-images-row">
            <AdminCropImageField
              label="Kapak görseli"
              help={`Yatay (16:9) kırpma önerilir. En fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
              value={form.coverUrl}
              aspect={16 / 9}
              thumbClass="admin-training-image-field__thumb--cover"
              onChange={(coverUrl) => setForm((f) => ({ ...f, coverUrl }))}
              onFileChange={(file) => setCoverFile(file)}
            />
            <AdminCropImageField
              label="Afiş"
              help={`Dikey (2:3) poster alanına uyar. En fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
              value={form.posterUrl}
              aspect={2 / 3}
              thumbClass="admin-training-image-field__thumb--poster"
              onChange={(posterUrl) => setForm((f) => ({ ...f, posterUrl }))}
              onFileChange={(file) => setPosterFile(file)}
            />
          </div>
        </AccordionSection>

        {/* ── 4. İçerik ── */}
        <AccordionSection
          id="content"
          icon={<IconContent />}
          title="İçerik"
          subtitle="Açıklama, özet, konuşmacılar ve müfredat"
          open={openSections.content}
          onToggle={toggleSection}
        >
          <div className="ate-grid">
            <label className="admin-field admin-field--full">
              <span>Kısa açıklama *</span>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                required
                placeholder="Eğitimin kısa tanıtım metni…"
              />
            </label>

            <label className="admin-field admin-field--full">
              <span>Öne çıkan maddeler</span>
              <p className="admin-field__help">
                Her satır, detay sayfasında ayrı bir madde olarak listelenir.
              </p>
              <textarea
                rows={3}
                value={form.highlightsText}
                onChange={(e) => setForm((f) => ({ ...f, highlightsText: e.target.value }))}
                placeholder="Etkinliğin öne çıkan noktalarını kısaca yazın…"
              />
            </label>

            <TrainingEventSpeakersField
              speakers={form.speakers}
              onChange={(speakers) => setForm((f) => ({ ...f, speakers }))}
            />

            <TrainingEventCurriculumField
              items={form.curriculum}
              onChange={(curriculum) => setForm((f) => ({ ...f, curriculum }))}
            />
          </div>
        </AccordionSection>

        {/* ── Footer ── */}
        <div className="ate-footer">
          <Link href={LIST_HREF} className="admin-btn admin-btn--ghost">
            Vazgeç
          </Link>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={saving}
          >
            {saving ? "Kaydediliyor…" : mode === "create" ? "Oluştur" : "Kaydet"}
          </button>
        </div>
      </form>

      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
