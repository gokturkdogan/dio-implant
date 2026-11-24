/**
 * next/image için özel loader (next.config.ts → images.loaderFile).
 *
 * Cloudinary görselleri, boyutlandırma ve format dönüşümü Cloudinary'nin kendi
 * CDN'inde yapılacak şekilde doğrudan Cloudinary URL'sine çevrilir. Böylece görseller
 * hosting platformunun görsel servisinden geçmez; istek ve bant genişliği kotası
 * harcanmaz. Responsive davranış (srcset/sizes) aynen korunur.
 *
 * Cloudinary dışındaki adresler (ör. www.dioimplant.com) olduğu gibi döndürülür.
 */
const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const idx = src.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (src.startsWith("https://res.cloudinary.com/") && idx !== -1) {
    const head = src.slice(0, idx + CLOUDINARY_UPLOAD_MARKER.length);
    const rest = src.slice(idx + CLOUDINARY_UPLOAD_MARKER.length);
    const q = quality ? `q_${quality}` : "q_auto";
    // c_limit: görsel hiçbir zaman orijinalinden büyütülmez.
    return `${head}f_auto,${q},w_${width},c_limit/${rest}`;
  }
  return src;
}
