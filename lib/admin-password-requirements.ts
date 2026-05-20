import { z } from "zod";

export const ADMIN_NEW_PASSWORD_MIN_LENGTH = 8;
export const ADMIN_NEW_PASSWORD_MAX_LENGTH = 256;

export type PasswordRequirementItem = {
  id: string;
  label: string;
  met: boolean;
};

export type PasswordComplexityRule = {
  id: string;
  label: string;
  message: string;
  test: (password: string) => boolean;
};

/** UI listesi ve Zod doğrulaması için tek kaynak. */
export const ADMIN_PASSWORD_COMPLEXITY_RULES: PasswordComplexityRule[] = [
  {
    id: "minLength",
    label: `En az ${ADMIN_NEW_PASSWORD_MIN_LENGTH} karakter`,
    message: `Yeni parola en az ${ADMIN_NEW_PASSWORD_MIN_LENGTH} karakter olmalı`,
    test: (p) => p.length >= ADMIN_NEW_PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "En az bir büyük harf",
    message: "En az bir büyük harf içermeli",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "En az bir küçük harf",
    message: "En az bir küçük harf içermeli",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "digit",
    label: "En az bir rakam",
    message: "En az bir rakam içermeli",
    test: (p) => /\d/.test(p),
  },
  {
    id: "special",
    label: "En az bir özel karakter",
    message: "En az bir özel karakter içermeli (!@#$%…)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function createAdminNewPasswordZodSchema() {
  let schema = z
    .string()
    .min(ADMIN_NEW_PASSWORD_MIN_LENGTH, ADMIN_PASSWORD_COMPLEXITY_RULES[0].message)
    .max(
      ADMIN_NEW_PASSWORD_MAX_LENGTH,
      `Parola en fazla ${ADMIN_NEW_PASSWORD_MAX_LENGTH} karakter olabilir`,
    );

  for (const rule of ADMIN_PASSWORD_COMPLEXITY_RULES) {
    if (rule.id === "minLength") continue;
    schema = schema.refine(rule.test, { message: rule.message });
  }

  return schema;
}

export function getPasswordRequirementItems(
  password: string,
  confirmPassword?: string,
): PasswordRequirementItem[] {
  const items: PasswordRequirementItem[] = ADMIN_PASSWORD_COMPLEXITY_RULES.map(
    (rule) => ({
      id: rule.id,
      label: rule.label,
      met: rule.test(password),
    }),
  );

  if (confirmPassword !== undefined) {
    items.push({
      id: "match",
      label: "Parolalar eşleşiyor",
      met:
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword,
    });
  }

  return items;
}

export function allPasswordRequirementsMet(
  password: string,
  confirmPassword?: string,
): boolean {
  return getPasswordRequirementItems(password, confirmPassword).every(
    (item) => item.met,
  );
}
