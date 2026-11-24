import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Public sitede tam sayfa geçişi bilinçli tercih (bkz. components/common/site-link.tsx):
      // her geçiş CDN'deki HTML'den sunulur, sunucu fonksiyonu çalışmaz.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default config;
