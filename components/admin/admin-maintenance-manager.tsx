"use client";

import { useState } from "react";
import { AdminToast, type AdminToastState } from "./admin-toast";

type Props = {
  initialEnabled: boolean;
  initialMessage: string;
};

function readError(data: unknown, fallback: string) {
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

export function AdminMaintenanceManager({
  initialEnabled,
  initialMessage,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState(initialMessage);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<AdminToastState>(null);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({
          id: Date.now(),
          message: readError(data, "Bakım modu kaydedilemedi."),
          variant: "error",
        });
        return;
      }
      setToast({
        id: Date.now(),
        message: enabled
          ? "Bakım modu aktif edildi."
          : "Bakım modu pasif edildi.",
        variant: "success",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-contact-form">
        <div className="admin-contact-grid">
          <label className="admin-field admin-field--full">
            <span>Bakım modu durumu</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <input
                id="maintenance-enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span style={{ margin: 0 }}>
                {enabled ? "Aktif" : "Pasif"}
              </span>
            </div>
            <span className="admin-field__help">
              Aktifken ziyaretçiler bakım sayfasına yönlendirilir. Admin panel
              erişimi açık kalır.
            </span>
          </label>

          <label className="admin-field admin-field--full">
            <span>Bakım mesajı (opsiyonel)</span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={240}
              placeholder="Örn. Altyapı güncellemesi nedeniyle kısa süreli bakım yapıyoruz."
            />
          </label>
        </div>

        <div className="admin-contact-form__actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </>
  );
}

