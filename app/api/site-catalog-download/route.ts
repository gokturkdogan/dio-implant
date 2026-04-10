import { NextResponse } from "next/server";
import {
  isCatalogHttpUrl,
  toCatalogDownloadFetchUrl,
} from "@/lib/catalog-download-helpers";
import { slugify } from "@/lib/slug";
import { siteCatalogService } from "@/services/site-catalog.service";

export const runtime = "nodejs";

/**
 * Kataloglar sayfası kayıtları: PDF’i sunucudan çekip attachment olarak döner
 * (Drive görüntüleme linkleri indirme URL’sine çevrilir).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(String(searchParams.get("id") ?? "").trim());
  if (!Number.isFinite(id) || id < 1) {
    return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });
  }

  const row = await siteCatalogService.getById(id);
  if (!row) {
    return NextResponse.json({ error: "Katalog bulunamadı" }, { status: 404 });
  }

  const catalogUrl = String(row.pdfUrl ?? "").trim();
  if (!isCatalogHttpUrl(catalogUrl)) {
    return NextResponse.json({ error: "PDF bağlantısı yok" }, { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(toCatalogDownloadFetchUrl(catalogUrl), {
      redirect: "follow",
      headers: {
        Accept: "application/pdf,application/octet-stream;q=0.9,*/*;q=0.1",
        "User-Agent":
          "Mozilla/5.0 (compatible; DIO-Implant-SiteCatalog/1.0; +https://www.dioimplant.com)",
      },
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    return NextResponse.json({ error: "PDF indirilemedi" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "PDF kaynağı yanıt vermedi" }, { status: 502 });
  }

  const data = await upstream.arrayBuffer();

  const base = slugify(row.title) || `katalog-${id}`;
  const fileName = `${base}-katalog.pdf`;

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
