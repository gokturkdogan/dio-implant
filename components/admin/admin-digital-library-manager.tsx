"use client";

import { useState } from "react";
import { useAdminToast } from "./admin-toast-provider";

type Props = {
  initialZipUrl: string;
  initialPptUrl: string;
};

function formatApiError(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}

export function AdminDigitalLibraryManager({
  initialZipUrl,
  initialPptUrl,
}: Props) {
  const { showToast } = useAdminToast();
  const [saving, setSaving] = useState(false);
  const [zipUrl, setZipUrl] = useState(initialZipUrl);
  const [pptUrl, setPptUrl] = useState(initialPptUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/digital-library", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ zipUrl, pptUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(formatApiError(data, "Kaydedilemedi."), "error");
        return;
      }
      showToast("Dijital kütüphane bağlantıları kaydedildi.", "success");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-contact-form" onSubmit={(ev) => void handleSubmit(ev)}>
        <div className="admin-contact-grid">
          <label className="admin-field admin-field--full">
            <span>ZIP dosyası URL</span>
            <input
              value={zipUrl}
              onChange={(e) => setZipUrl(e.target.value)}
              type="url"
              inputMode="url"
              placeholder="https://… veya /dosya.zip"
              maxLength={2048}
              autoComplete="off"
            />
            <span className="admin-field__help">
              Dijital kütüphane ZIP arşivi için tam adres (CDN veya site içi
              yol).
            </span>
          </label>
          <label className="admin-field admin-field--full">
            <span>PPT dosyası URL</span>
            <input
              value={pptUrl}
              onChange={(e) => setPptUrl(e.target.value)}
              type="url"
              inputMode="url"
              placeholder="https://… veya /sunum.pptx"
              maxLength={2048}
              autoComplete="off"
            />
            <span className="admin-field__help">
              Sunum dosyası (PPT / PPTX) için tam adres.
            </span>
          </label>
        </div>
        <div className="admin-contact-form__actions">
          <button className="admin-btn admin-btn--primary" type="submit" disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
  );
}
