"use client";

import { useCallback, useState } from "react";
import type { SiteContact } from "@/db/schema/site-contact";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";

type Props = {
  initial: SiteContact;
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

export function AdminSiteContactForm({ initial }: Props) {
  const [toast, setToast] = useState<AdminToastState>(null);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [centerLabel, setCenterLabel] = useState(initial.centerLabel);
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [hours, setHours] = useState(initial.hours);
  const [mapDirectionsUrl, setMapDirectionsUrl] = useState(initial.mapDirectionsUrl);
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial.mapEmbedUrl);

  const showToast = useCallback((message: string, variant: AdminToastVariant) => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          companyName,
          centerLabel,
          address,
          phone,
          email,
          hours,
          mapDirectionsUrl,
          mapEmbedUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(formatApiError(data, "Kaydedilemedi."), "error");
        return;
      }
      showToast("İletişim bilgileri kaydedildi.", "success");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <form className="admin-contact-form" onSubmit={(ev) => void handleSubmit(ev)}>
        <div className="admin-contact-grid">
          <label className="admin-field admin-field--full">
            <span>Ünvan (tam ticari ad)</span>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Örn. DIO Implant Türkiye Genel Merkez"
              maxLength={300}
            />
          </label>
          <label className="admin-field admin-field--full">
            <span>Merkez ofis (şehir / bölge)</span>
            <input
              value={centerLabel}
              onChange={(e) => setCenterLabel(e.target.value)}
              placeholder="Örn. İstanbul"
              maxLength={200}
            />
          </label>
          <label className="admin-field admin-field--full">
            <span>Adres</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Cadde, sokak, no, ilçe / şehir"
              rows={3}
              maxLength={500}
            />
          </label>
          <label className="admin-field">
            <span>Telefon</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 …"
              maxLength={80}
            />
          </label>
          <label className="admin-field">
            <span>E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@…"
              maxLength={200}
            />
          </label>
          <label className="admin-field admin-field--full">
            <span>Çalışma saatleri</span>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Hafta içi 09:00–18:00, Cumartesi …"
              maxLength={500}
            />
          </label>
          <label className="admin-field admin-field--full">
            <span>Google Maps yol tarifi URL’si</span>
            <input
              value={mapDirectionsUrl}
              onChange={(e) => setMapDirectionsUrl(e.target.value)}
              placeholder="https://…"
              maxLength={2048}
            />
          </label>
          <label className="admin-field admin-field--full">
            <span>Harita embed URL’si (iframe src)</span>
            <input
              value={mapEmbedUrl}
              onChange={(e) => setMapEmbedUrl(e.target.value)}
              placeholder="https://www.google.com/maps/embed?…"
              maxLength={2048}
            />
            <span className="admin-field__help">
              İletişim sayfasındaki harita kutusu bu adresi kullanır. Boş bırakırsanız harita gösterilmez.
            </span>
          </label>
        </div>
        <div className="admin-contact-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </>
  );
}
