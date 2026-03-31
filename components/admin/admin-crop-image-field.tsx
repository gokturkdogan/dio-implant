"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import {
  MAX_ADMIN_IMAGE_UPLOAD_BYTES,
  MAX_ADMIN_IMAGE_UPLOAD_MB,
} from "@/lib/admin-image-upload";

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
    canvas.height,
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
      0.9,
    );
  });
}

type ThumbClass =
  | "admin-training-image-field__thumb--cover"
  | "admin-training-image-field__thumb--poster"
  | "admin-training-image-field__thumb--speaker"
  | "admin-training-image-field__thumb--category";

type Props = {
  label: string;
  help?: string;
  /** Mevcut (https) URL veya yerel blob önizleme */
  value: string;
  aspect: number;
  thumbClass: ThumbClass;
  /** Önizleme URL'i değiştiğinde (blob URL veya boş) */
  onChange: (previewUrl: string) => void;
  /** Kırpılmış File hazır olduğunda veya kaldırıldığında */
  onFileChange: (file: File | null) => void;
};

export function AdminCropImageField({
  label,
  help,
  value,
  aspect,
  thumbClass,
  onChange,
  onFileChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceBaseName, setSourceBaseName] = useState("gorsel");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Lütfen geçerli bir görsel seçin.");
      return;
    }
    if (file.size > MAX_ADMIN_IMAGE_UPLOAD_BYTES) {
      setError(`Dosya en fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB olabilir.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(String(reader.result));
      setSourceBaseName(file.name.replace(/\.[^/.]+$/, "") || "gorsel");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const closeModal = () => {
    setCropModalOpen(false);
    setSourceImage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onConfirmCrop = async () => {
    if (!sourceImage || !croppedAreaPixels) return;
    setError(null);
    try {
      const croppedBlob = await getCroppedBlob(sourceImage, croppedAreaPixels);
      const file = new File([croppedBlob], `${sourceBaseName}.webp`, {
        type: "image/webp",
      });
      const blobUrl = URL.createObjectURL(croppedBlob);
      onChange(blobUrl);
      onFileChange(file);
      closeModal();
    } catch {
      setError("Kırpma sırasında bir hata oluştu.");
    }
  };

  const onRemove = () => {
    onChange("");
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const cropModal =
    cropModalOpen && sourceImage && mounted ? (
      <div className="admin-crop-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="admin-crop-modal__backdrop"
          onClick={closeModal}
          aria-label="Kırpma penceresini kapat"
        />
        <div className="admin-crop-modal__panel">
          <div className="admin-crop-modal__header">
            <h3>Görseli kırp</h3>
            <button
              type="button"
              className="admin-btn"
              onClick={closeModal}
            >
              Vazgeç
            </button>
          </div>

          <div className="admin-crop-modal__cropper">
            <Cropper
              image={sourceImage}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
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
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={onConfirmCrop}
              disabled={!croppedAreaPixels}
            >
              Onayla
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="admin-training-image-field">
      <div className={`admin-training-image-field__thumb ${thumbClass}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="admin-training-image-field__img" />
        ) : (
          <span className="admin-training-image-field__placeholder">Önizleme yok</span>
        )}
      </div>

      <div className="admin-training-image-field__body">
        <span className="admin-training-image-field__label">{label}</span>
        {help ? (
          <p className="admin-field__help admin-training-image-field__help">{help}</p>
        ) : null}
        {error ? (
          <p className="admin-training-image-field__error" role="alert">
            {error}
          </p>
        ) : null}
        <input
          ref={inputRef}
          className="admin-upload__input"
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          aria-label={label}
        />
        <div className="admin-training-image-field__actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-upload__pick"
            onClick={() => inputRef.current?.click()}
          >
            Görsel seç
          </button>
          {value ? (
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={onRemove}
            >
              Kaldır
            </button>
          ) : null}
        </div>
        <p className="admin-upload__hint admin-training-image-field__hint">
          Seçim sonrası kırpma ekranı açılır. En fazla {MAX_ADMIN_IMAGE_UPLOAD_MB} MB.
        </p>
      </div>

      {mounted && cropModal ? createPortal(cropModal, document.body) : null}
    </div>
  );
}
