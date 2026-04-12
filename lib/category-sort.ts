/** Kategori sırası: önce `sort_order`, eşitse isim (tr). Şema bağımlılığı yok — client güvenli. */
export function sortByOrderThenName<
  T extends { name: string; sortOrder?: number | null },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ao = a.sortOrder ?? 0;
    const bo = b.sortOrder ?? 0;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, "tr");
  });
}
