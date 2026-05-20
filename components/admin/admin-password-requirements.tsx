"use client";

import { useMemo } from "react";
import { getPasswordRequirementItems } from "@/lib/admin-password-requirements";

function IconCheck() {
  return (
    <svg
      className="admin-password-reqs__icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconPending() {
  return (
    <span className="admin-password-reqs__dot" aria-hidden="true" />
  );
}

type Props = {
  password: string;
  confirmPassword?: string;
};

/** Sarı bilgi kutusu — parola kuralları, anlık yeşil + tik. */
export function AdminPasswordRequirements({ password, confirmPassword }: Props) {
  const items = useMemo(
    () => getPasswordRequirementItems(password, confirmPassword),
    [password, confirmPassword],
  );

  return (
    <div className="admin-password-reqs" role="status" aria-live="polite">
      <p className="admin-password-reqs__title">Parola gereksinimleri</p>
      <ul className="admin-password-reqs__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={
              item.met
                ? "admin-password-reqs__item admin-password-reqs__item--met"
                : "admin-password-reqs__item"
            }
          >
            <span className="admin-password-reqs__mark">
              {item.met ? <IconCheck /> : <IconPending />}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
