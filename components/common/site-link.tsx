import type { AnchorHTMLAttributes } from "react";

type SiteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

/**
 * Public sitede kullanılan düz link (tam sayfa geçişi).
 *
 * Neden `next/link` değil: Next.js'in istemci tarafı geçişleri (RSC istekleri)
 * CDN'de "hangi sayfadan gelindiğine" göre ayrı ayrı önbelleklenir; bu da her yeni
 * kombinasyonda sunucu fonksiyonu çalıştırır. Düz link ile her geçiş, CDN'de tek
 * kopyası tutulan normal bir HTML isteğidir. JS/CSS dosyaları tarayıcı önbelleğinden
 * geldiği için geçişler yine hızlıdır.
 *
 * İleride istemci tarafı geçişlere dönmek istenirse yalnızca bu dosyada
 * `next/link` döndürmek yeterlidir.
 */
export default function SiteLink({ href, ...rest }: SiteLinkProps) {
  return <a href={href} {...rest} />;
}
