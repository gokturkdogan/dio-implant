"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export type SearchableOption = {
  value: number | string;
  label: string;
  code?: string;
  disabled?: boolean;
  disabledReason?: string;
};

type Props = {
  options: SearchableOption[];
  value: Array<number | string>;
  onChange: (next: Array<number | string>) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  id?: string;
};

const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/[İIı]/g, "i")
    .replace(/\s+/g, " ")
    .trim();

const PANEL_GAP = 6;
const PANEL_MIN_W = 260;
const PANEL_MAX_H = 360;
const PANEL_MARGIN = 12; // ekranla minimum boşluk

/**
 * Tasarıma uyumlu searchable multi-select.
 * - Panel `createPortal` ile body'e açılır → modal/overflow taşması yok.
 * - Trigger konumuna göre yukarı/aşağı yönlenir, viewport sınırı içinde kalır.
 * - Bir seçenek seçildiğinde arama kutusu otomatik temizlenir, odak korunur.
 */
export function SearchableMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Seçin…",
  emptyText = "Sonuç yok",
  searchPlaceholder = "Ara…",
  disabled,
  id,
}: Props) {
  const reactId = useId();
  const wrapId = id ?? reactId;
  const inputId = `${wrapId}-search`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const valueSet = useMemo(() => new Set(value.map(String)), [value]);

  const selectedOptions = useMemo(
    () =>
      value
        .map((v) => options.find((o) => String(o.value) === String(v)))
        .filter((o): o is SearchableOption => Boolean(o)),
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return options;
    return options.filter((o) => norm(`${o.code ?? ""} ${o.label}`).includes(q));
  }, [options, query]);

  // Panel konumlandırma
  const positionPanel = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const desiredWidth = Math.max(rect.width, PANEL_MIN_W);
    const left = Math.min(
      Math.max(PANEL_MARGIN, rect.left),
      vw - PANEL_MARGIN - desiredWidth,
    );

    const spaceBelow = vh - rect.bottom - PANEL_MARGIN;
    const spaceAbove = rect.top - PANEL_MARGIN;
    const openUp = spaceBelow < 220 && spaceAbove > spaceBelow;

    const maxH = Math.min(PANEL_MAX_H, openUp ? spaceAbove - PANEL_GAP : spaceBelow - PANEL_GAP);
    const top = openUp ? rect.top - PANEL_GAP : rect.bottom + PANEL_GAP;

    setPanelStyle({
      position: "fixed",
      left,
      top,
      width: desiredWidth,
      maxHeight: Math.max(220, maxH),
      transform: openUp ? "translateY(-100%)" : undefined,
      zIndex: 3000,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    positionPanel();
    const onResize = () => positionPanel();
    const onScroll = () => positionPanel();
    window.addEventListener("resize", onResize);
    // capture: modal içindeki scroll'u da yakala
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, positionPanel]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      setActiveIndex(0);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLLIElement>(`[data-idx="${activeIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const toggleValue = useCallback(
    (opt: SearchableOption) => {
      if (opt.disabled) return;
      const key = String(opt.value);
      const isSelected = valueSet.has(key);
      let next: Array<number | string>;
      if (isSelected) {
        next = value.filter((v) => String(v) !== key);
      } else {
        next = [...value, opt.value];
      }
      const order = new Map(options.map((o, i) => [String(o.value), i]));
      next.sort((a, b) => (order.get(String(a)) ?? 0) - (order.get(String(b)) ?? 0));
      onChange(next);
      // Seçim sonrası arama metnini sıfırla, fokusu inputta tut
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [onChange, options, value, valueSet],
  );

  const removeValue = useCallback(
    (val: number | string) => {
      onChange(value.filter((v) => String(v) !== String(val)));
    },
    [onChange, value],
  );

  const clearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) toggleValue(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Backspace" && !query && selectedOptions.length > 0) {
      e.preventDefault();
      const last = selectedOptions[selectedOptions.length - 1];
      if (last) removeValue(last.value);
    }
  };

  const panel =
    open && mounted && panelStyle
      ? createPortal(
          <div
            ref={panelRef}
            className="smselect__panel"
            role="dialog"
            style={panelStyle}
          >
            <div className="smselect__search">
              <svg
                className="smselect__search-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path
                  d="m20 20-3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder={searchPlaceholder}
                autoComplete="off"
                spellCheck={false}
              />
              {selectedOptions.length > 0 ? (
                <button
                  type="button"
                  className="smselect__clear"
                  onClick={clearAll}
                  title="Tümünü temizle"
                >
                  Temizle
                </button>
              ) : null}
            </div>

            <ul
              ref={listRef}
              id={`${wrapId}-list`}
              className="smselect__list"
              role="listbox"
              aria-multiselectable="true"
            >
              {filtered.length === 0 ? (
                <li className="smselect__empty">{emptyText}</li>
              ) : (
                filtered.map((opt, idx) => {
                  const isSelected = valueSet.has(String(opt.value));
                  const isActive = idx === activeIndex;
                  return (
                    <li
                      key={opt.value}
                      data-idx={idx}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled || undefined}
                      className={[
                        "smselect__option",
                        isSelected ? "is-selected" : "",
                        isActive ? "is-active" : "",
                        opt.disabled ? "is-disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleValue(opt)}
                      title={opt.disabled ? opt.disabledReason : undefined}
                    >
                      <span className="smselect__check" aria-hidden="true">
                        {isSelected ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="m5 12 5 5L20 7"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                      </span>
                      {opt.code ? <em className="smselect__option-code">{opt.code}</em> : null}
                      <span className="smselect__option-label">{opt.label}</span>
                      {opt.disabled && opt.disabledReason ? (
                        <small className="smselect__option-hint">{opt.disabledReason}</small>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>

            <div className="smselect__footer">
              <span>
                <strong>{selectedOptions.length}</strong> seçili
                {options.length > 0 ? ` / ${options.length}` : null}
              </span>
              <button
                type="button"
                className="smselect__close"
                onClick={() => setOpen(false)}
              >
                Kapat
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  const onTriggerKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div
      id={wrapId}
      className={`smselect ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
    >
      <div
        ref={triggerRef}
        className="smselect__trigger"
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${wrapId}-list`}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && setOpen((s) => !s)}
        onKeyDown={onTriggerKey}
      >
        <div className="smselect__chips">
          {selectedOptions.length === 0 ? (
            <span className="smselect__placeholder">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span key={opt.value} className="smselect__chip">
                {opt.code ? <em className="smselect__chip-code">{opt.code}</em> : null}
                <span>{opt.label}</span>
                <button
                  type="button"
                  className="smselect__chip-remove"
                  aria-label={`${opt.label} kaldır`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(opt.value);
                  }}
                  tabIndex={-1}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <span className="smselect__caret" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {panel}
    </div>
  );
}
