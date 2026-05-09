"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AdminToast, type AdminToastVariant } from "./admin-toast";

type QueueItem = {
  id: number;
  message: string;
  variant: AdminToastVariant;
};

const AdminToastContext = createContext<{
  showToast: (message: string, variant?: AdminToastVariant, durationMs?: number) => void;
} | null>(null);

const DEFAULT_DURATION_MS = 4200;
const MAX_VISIBLE = 5;

function ToastViewport({
  items,
  onDismiss,
}: {
  items: QueueItem[];
  onDismiss: (id: number) => void;
}) {
  if (items.length === 0) return null;
  return createPortal(
    <div className="admin-toast-viewport" aria-live="polite">
      {items.map((t) => (
        <AdminToast
          key={t.id}
          toast={{ id: t.id, message: t.message, variant: t.variant }}
          onClose={() => onDismiss(t.id)}
        />
      ))}
    </div>,
    document.body,
  );
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimer = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimer(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    },
    [clearTimer],
  );

  const showToast = useCallback(
    (message: string, variant: AdminToastVariant = "info", durationMs: number = DEFAULT_DURATION_MS) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setItems((prev) => {
        const trimmed = prev.slice(-(MAX_VISIBLE - 1));
        for (const dropped of prev.slice(0, prev.length - trimmed.length)) {
          clearTimer(dropped.id);
        }
        return [...trimmed, { id, message, variant }];
      });
      if (durationMs > 0) {
        const t = setTimeout(() => dismiss(id), durationMs);
        timers.current.set(id, t);
      }
    },
    [clearTimer, dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  useEffect(() => {
    return () => {
      for (const t of timers.current.values()) clearTimeout(t);
      timers.current.clear();
    };
  }, []);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      {mounted ? <ToastViewport items={items} onDismiss={dismiss} /> : null}
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast yalnızca AdminToastProvider içinde kullanılabilir.");
  }
  return ctx;
}

export type { AdminToastVariant };
