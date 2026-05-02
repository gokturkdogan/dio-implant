"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  /** "Rastgele üret" butonu için kullanılan id (genelde dealer.id; yoksa Date.now()). */
  seed?: number;
};

const DEFAULT = "#5B8DEF";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const HEX_PREFIXED_RE = /^#?[0-9a-fA-F]{0,6}$/;

function normalize(v: string): string {
  const t = v.trim();
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t}`;
}

function isValidHex(v: string): boolean {
  return HEX_RE.test(v);
}

/** Görsel olarak hoş, doygun bir hex renk üretir. */
function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 18);
  const l = 50 + Math.floor(Math.random() * 14);
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const c = lNorm - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Hex renk girişi: native renk seçici + 6 haneli hex input + rastgele üret butonu.
 * onChange yalnızca geçerli (#RRGGBB) bir renkle çağrılır; geçersiz girişlerde
 * yalnızca yerel taslak güncellenir, parent state korunur.
 */
export function ColorInput({ value, onChange, disabled }: Props) {
  const [draft, setDraft] = useState(value || DEFAULT);

  useEffect(() => {
    setDraft(value || DEFAULT);
  }, [value]);

  const commit = (next: string) => {
    const n = normalize(next).toUpperCase();
    if (isValidHex(n)) {
      onChange(n);
      setDraft(n);
    }
  };

  const onText = (raw: string) => {
    if (!HEX_PREFIXED_RE.test(raw)) return; // sayı/harf dışı karakter girmesin
    const n = normalize(raw).toUpperCase();
    setDraft(n);
    if (isValidHex(n)) onChange(n);
  };

  const safeColor = isValidHex(draft) ? draft : value || DEFAULT;

  return (
    <div className="color-input">
      <label className="color-input__swatch" style={{ background: safeColor }}>
        <input
          type="color"
          value={safeColor}
          disabled={disabled}
          onChange={(e) => commit(e.target.value)}
          aria-label="Renk seç"
        />
      </label>
      <div className="color-input__field">
        <span className="color-input__hash" aria-hidden="true">
          #
        </span>
        <input
          type="text"
          className="color-input__hex"
          value={draft.replace(/^#/, "")}
          onChange={(e) => onText(e.target.value)}
          placeholder="RRGGBB"
          maxLength={6}
          inputMode="text"
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <button
        type="button"
        className="color-input__random"
        onClick={() => commit(randomHex())}
        disabled={disabled}
        title="Rastgele bir renk üret"
      >
        Rastgele
      </button>
    </div>
  );
}
