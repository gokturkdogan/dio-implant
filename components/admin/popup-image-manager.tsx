"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context oluşturulamadı");

  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Kırpılan görsel oluşturulamadı"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      0.9
    );
  });
}

export function PopupImageManager() {
  const fallbackPreviewUrl =
    "https://res.cloudinary.com/drjz8v617/image/upload/HomeModal/modal-poster.webp";

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState(fallbackPreviewUrl);
  const [enabled, setEnabled] = useState(false);
  const [loadingPopup, setLoadingPopup] = useState(true);
  const [updatingEnabled, setUpdatingEnabled] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState("modal-poster");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<AdminToastState>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchPopupData = useCallback(async () => {
    setLoadingPopup(true);
    try {
      const res = await fetch("/api/site-popups/homepage", { cache: "no-store" });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body) {
        showToast("Popup ayarları alınamadı.", "error");
        return;
      }

      setEnabled(Boolean(body.enabled));
      setPreviewUrl(body.imageUrl || fallbackPreviewUrl);
    } catch {
      showToast("Popup ayarları alınamadı.", "error");
    } finally {
      setLoadingPopup(false);
    }
  }, []);

  const showToast = (message: string, variant: AdminToastVariant) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    const id = Date.now();
    setToast({ id, message, variant });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3600);
  };

  const patchPopup = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/site-popups/homepage", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(body?.error ?? "Güncelleme başarısız.");
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchPopupData();
  }, [fetchPopupData]);

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Lütfen geçerli bir görsel seçin.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(String(reader.result));
      setSourceFileName(file.name.replace(/\.[^/.]+$/, "") || "modal-poster");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const onUploadCropped = async () => {
    if (!sourceImage || !croppedAreaPixels) return;

    try {
      setUploading(true);

      const croppedBlob = await getCroppedBlob(sourceImage, croppedAreaPixels);
      const file = new File([croppedBlob], `${sourceFileName}.webp`, {
        type: "image/webp",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(body?.error ?? "Upload başarısız.", "error");
        return;
      }

      if (body?.url) {
        await patchPopup({ imageUrl: body.url });
      }

      setCropModalOpen(false);
      setSourceImage(null);
      await fetchPopupData();
      showToast("Görsel başarıyla güncellendi.", "success");
    } catch {
      showToast("Upload sırasında bir hata oluştu.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onToggleEnabled = async (next: boolean) => {
    try {
      setUpdatingEnabled(true);
      await patchPopup({ enabled: next });
      await fetchPopupData();
      showToast(
        next ? "Popup aktif hale getirildi." : "Popup pasif hale getirildi.",
        "success"
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Aktif/pasif güncellenemedi.";
      showToast(msg, "error");
    } finally {
      setUpdatingEnabled(false);
    }
  };

  if (!mounted) {
    return (
      <div className="admin-popup">
        <div className="admin-popup__preview">
          <img src={fallbackPreviewUrl} alt="Popup görseli" />
          <div className="admin-popup__badge">Mevcut Görsel</div>
        </div>
        <div className="admin-popup__form">
          <div className="admin-upload">
            <div className="admin-upload__title">Yukleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-popup">
        <div className="admin-popup__preview">
          <img src={previewUrl} alt="Popup görseli" />
          <div className="admin-popup__badge">Mevcut Görsel</div>
        </div>

        <div className="admin-popup__form">
          <div className="admin-popup__switch-row">
            <span className="admin-popup__switch-label">Gösterim durumu</span>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={enabled}
                disabled={loadingPopup || updatingEnabled}
                onChange={(e) => onToggleEnabled(e.target.checked)}
              />
              <span className="admin-toggle__ui" />
              <span className="admin-toggle__text">{enabled ? "Aktif" : "Pasif"}</span>
            </label>
          </div>

          <div className="admin-upload">
            <div className="admin-upload__title">Yeni görsel yükle</div>

            <input
              ref={inputRef}
              id="adminPopupFile"
              className="admin-upload__input"
              type="file"
              accept="image/*"
              onChange={onSelectFile}
            />
            <button
              className="admin-btn admin-btn--ghost admin-upload__pick"
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || loadingPopup}
            >
              Dosya Seç
            </button>

            <div className="admin-upload__hint">
              Dosya seçimi sonrası kırpma ekranı açılır. Tamamla ile yüklenir.
            </div>
          </div>
        </div>
      </div>

      <AdminToast toast={toast} onClose={() => setToast(null)} />

      {cropModalOpen && sourceImage ? (
        <div className="admin-crop-modal" role="dialog" aria-modal="true">
          <button
            className="admin-crop-modal__backdrop"
            onClick={() => {
              if (uploading) return;
              setCropModalOpen(false);
            }}
            aria-label="Kırpma modalını kapat"
          />
          <div className="admin-crop-modal__panel">
            <div className="admin-crop-modal__header">
              <h3>Görseli Kırp</h3>
              <button
                className="admin-btn"
                type="button"
                disabled={uploading}
                onClick={() => setCropModalOpen(false)}
              >
                Vazgeç
              </button>
            </div>

            <div className="admin-crop-modal__cropper">
              <Cropper
                image={sourceImage}
                crop={crop}
                zoom={zoom}
                aspect={2 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
              />
            </div>

            <div className="admin-crop-modal__controls">
              <label className="admin-crop-modal__zoom">
                <span>Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </label>

              <button
                className="admin-btn admin-btn--primary"
                type="button"
                onClick={onUploadCropped}
                disabled={uploading || !croppedAreaPixels}
              >
                {uploading ? "Yükleniyor..." : "Tamamla"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

