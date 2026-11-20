/**
 * Ziyaretçi başına çağrılan küçük public JSON uçları için CDN önbellek başlıkları.
 *
 * - Tarayıcı her seferinde CDN'e sorar (max-age=0), böylece veri eskimiş kalmaz.
 * - CDN (Netlify, ayrıca standart CDN-Cache-Control destekleyen platformlar) yanıtı
 *   `seconds` süre boyunca paylaşımlı olarak saklar; bu sürede fonksiyon çalışmaz.
 * - `durable`: Netlify'ın tüm edge noktalarının paylaştığı kalıcı önbellek.
 *
 * Sonuç: trafik ne kadar artarsa artsın uç, süre başına en fazla bir kez fonksiyon çalıştırır.
 */
export function publicCdnCacheHeaders(seconds: number): HeadersInit {
  const swr = seconds * 5;
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${swr}`,
    "Netlify-CDN-Cache-Control": `public, durable, s-maxage=${seconds}, stale-while-revalidate=${swr}`,
  };
}
