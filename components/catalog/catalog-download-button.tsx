"use client";

import { useState } from "react";

type Props = {
  slug: string;
  fileName: string;
};

export function CatalogDownloadButton({ slug, fileName }: Props) {
  const [loading, setLoading] = useState(false);

  const onDownload = async () => {
    if (loading) return;
    const startedAt = Date.now();
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog-download?urun=${encodeURIComponent(slug)}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Katalog indirilemedi");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: direct navigation keeps download possible on edge cases.
      window.location.href = `/api/catalog-download?urun=${encodeURIComponent(slug)}`;
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
      }
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`catalog-btn catalog-btn--primary${loading ? " catalog-btn--loading" : ""}`}
      onClick={onDownload}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? (
        <span className="catalog-spinner" aria-hidden="true" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      {loading ? "Indiriliyor..." : "Indir"}
    </button>
  );
}

