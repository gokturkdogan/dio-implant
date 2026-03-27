import Script from "next/script";
import { HomepageContent } from "../components/home/homepage-content";

export default function HomePage() {
  return (
    <>
      <HomepageContent />
      <Script src="/homepage/script.js" strategy="afterInteractive" />
    </>
  );
}
