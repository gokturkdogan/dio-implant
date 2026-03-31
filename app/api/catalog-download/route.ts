import { NextResponse } from "next/server";
import { productService } from "@/services/product.service";

export const runtime = "nodejs";

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

function toDownloadUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (!m?.[1]) return url;
  return `https://drive.google.com/uc?export=download&id=${m[1]}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = String(searchParams.get("urun") ?? "").trim();
  if (!slug) {
    return NextResponse.json({ error: "Urun bilgisi eksik" }, { status: 400 });
  }

  let product;
  try {
    product = await productService.getBySlug(slug);
  } catch {
    return NextResponse.json({ error: "Urun bulunamadi" }, { status: 404 });
  }

  const catalogUrl = String(product.catalogUrl ?? "").trim();
  if (!isHttpUrl(catalogUrl)) {
    return NextResponse.json({ error: "Katalog linki bulunamadi" }, { status: 404 });
  }

  const upstream = await fetch(toDownloadUrl(catalogUrl), { redirect: "follow" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "Katalog indirilemedi" }, { status: 502 });
  }

  const data = await upstream.arrayBuffer();
  const fileName = `${product.slug}-katalog.pdf`;

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

