import type { InputHTMLAttributes } from "react";

/** Tarayıcı yazım denetimi / otomatik düzeltme parolada kırmızı alt çizgi yapar. */
export const ADMIN_PASSWORD_INPUT_ATTRS = {
  spellCheck: false,
  autoCorrect: "off",
  autoCapitalize: "off",
} as const satisfies Partial<InputHTMLAttributes<HTMLInputElement>>;
