"use client";

export type AdminToastVariant = "success" | "error" | "info";

export type AdminToastState = {
  id: number;
  message: string;
  variant: AdminToastVariant;
} | null;

type AdminToastProps = {
  toast: AdminToastState;
  onClose: () => void;
};

export function AdminToast({ toast, onClose }: AdminToastProps) {
  if (!toast) return null;

  return (
    <div className={`admin-toast admin-toast--${toast.variant}`} role="status" aria-live="polite">
      <div className="admin-toast__content">
        <span className="admin-toast__dot" aria-hidden="true" />
        <span className="admin-toast__message">{toast.message}</span>
      </div>
      <button className="admin-toast__close" type="button" onClick={onClose} aria-label="Bildirimi kapat">
        ×
      </button>
    </div>
  );
}

