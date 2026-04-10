"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
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
  | "admin-training-image-field__thumb--category"
  | "admin-training-image-field__thumb--catalog-a4";

type Props = {
  label: string;
  help?: string;
  /** Mevcut (https) URL veya yerel blob önizleme */
  value: string;
  /** Sabit oran. Verilmezse kaynak görselin doğal oranı kullanılır (serbest kırpma). */
  aspect?: number;
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
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceBaseName, setSourceBaseName] = useState("gorsel");
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onCropComplete = useCallback((pixelCrop: PixelCrop) => {
    if (pixelCrop.width <= 0 || pixelCrop.height <= 0) return;
    setCroppedAreaPixels({
      x: pixelCrop.x,
      y: pixelCrop.y,
      width: pixelCrop.width,
      height: pixelCrop.height,
    });
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
      const dataUrl = String(reader.result);
      setSourceImage(dataUrl);
      setSourceBaseName(file.name.replace(/\.[^/.]+$/, "") || "gorsel");
      setCrop({ unit: "%", x: 10, y: 10, width: 80, height: 80 });
      setCroppedAreaPixels(null);
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
      const img = imageRef.current;
      let scaledArea = croppedAreaPixels;
      if (img && img.naturalWidth > 0 && img.width > 0) {
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        scaledArea = {
          x: Math.round(croppedAreaPixels.x * scaleX),
          y: Math.round(croppedAreaPixels.y * scaleY),
          width: Math.round(croppedAreaPixels.width * scaleX),
          height: Math.round(croppedAreaPixels.height * scaleY),
        };
      }
      const croppedBlob = await getCroppedBlob(sourceImage, scaledArea);
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
              className="admin-btn admin-btn--ghost"
              onClick={closeModal}
            >
              Vazgeç
            </button>
          </div>

          <div className="admin-crop-modal__cropper">
            <ReactCrop
              crop={crop}
              onChange={(next) => setCrop(next)}
              onComplete={onCropComplete}
              aspect={aspect}
              minWidth={32}
              minHeight={32}
              keepSelection
              ruleOfThirds
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imageRef}
                src={sourceImage}
                alt="Kırpılacak görsel"
                className="admin-crop-modal__image"
              />
            </ReactCrop>
          </div>

          <div className="admin-crop-modal__controls">
            <p className="admin-crop-modal__freehint">
              Kırpma kutusunu kenarlardan veya köşelerden sürükleyerek serbestçe boyutlandırın.
            </p>

            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={onConfirmCrop}
              disabled={!croppedAreaPixels}
            >
              Kırp ve kullan
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
              className="admin-icon-btn admin-icon-btn--danger"
              onClick={onRemove}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              Kaldır
            </button>
          ) : null}
        </div>
        <p className="admin-upload__hint admin-training-image-field__hint">En fazla {MAX_ADMIN_IMAGE_UPLOAD_MB} MB.</p>
      </div>

      {mounted && cropModal ? createPortal(cropModal, document.body) : null}
    </div>
  );
}
