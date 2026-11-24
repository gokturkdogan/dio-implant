import { notFound } from "next/navigation";

/**
 * Eşleşmeyen tüm adresler (bot taramaları, eski linkler vb.) buraya düşer.
 * Next.js'in varsayılan 404'ü önbelleklenmez ve her istekte fonksiyon çalıştırır;
 * bu sayfa ISR olduğu için her adresin 404 yanıtı CDN'de saklanır.
 */
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function CatchAllNotFoundPage() {
  notFound();
}
