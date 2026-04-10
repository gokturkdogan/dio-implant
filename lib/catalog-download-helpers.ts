/** PDF / katalog için geçerli uzaktan adres mi? */
export function isCatalogHttpUrl(value: string): boolean {
  const t = value.trim();
  return t.startsWith("http://") || t.startsWith("https://");
}

/**
 * Google Drive “dosya görüntüle” linkini doğrudan indirme isteğine uygun URL’ye çevirir.
 * Diğer adresler aynen döner.
 */
export function toCatalogDownloadFetchUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (!m?.[1]) return url;
  return `https://drive.google.com/uc?export=download&id=${m[1]}`;
}
