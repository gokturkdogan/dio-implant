/**
 * Bayi id'sinden deterministik, görsel olarak ayırt edilebilir bir renk üretir.
 *
 * - Hue: golden ratio (0.61803398875) ile dağıtılır → ardışık id'ler birbirinden uzak hue'lar alır
 * - Saturation/Lightness sabit aralıkta (canlı ama okunaklı)
 * - id'ye göre küçük varyasyonlarla aynı hue komşuları arasında da fark oluşur
 */
const GOLDEN_RATIO_CONJUGATE = 0.61803398875;

export function dealerColorFromId(id: number): string {
  const seed = (id * 9301 + 49297) % 233280;
  const baseHue = (seed * GOLDEN_RATIO_CONJUGATE) % 1;
  const hue = Math.floor(baseHue * 360);
  // küçük saturation/lightness oynaması ile aynı çevredeki renkleri de ayırır
  const sat = 62 + ((id * 7) % 20); // 62-82
  const light = 52 + ((id * 13) % 14); // 52-66
  return `hsl(${hue} ${sat}% ${light}%)`;
}
