import Script from "next/script";
import type { ReactNode } from "react";
import { AdminPanelProviders } from "../../components/admin/admin-panel-providers";
import {
  ADMIN_THEME_COOKIE_NAME,
  ADMIN_THEME_LOCAL_STORAGE_KEY,
} from "../../lib/admin-theme";

/** Runs before paint; syncs cookie ↔ localStorage. Keys from `lib/admin-theme.ts`. */
function adminThemeBootScript() {
  const lk = JSON.stringify(ADMIN_THEME_LOCAL_STORAGE_KEY);
  const ck = JSON.stringify(ADMIN_THEME_COOKIE_NAME);
  return `(function(){try{var lk=${lk};var ck=${ck};function readCookie(){try{if(!document.cookie)return null;var parts=document.cookie.split(";");for(var i=0;i<parts.length;i++){var p=parts[i].replace(/^\\s+/,"");if(p.indexOf(ck+"=")!==0)continue;var raw=p.slice(ck.length+1);var v=decodeURIComponent(raw.replace(/\\+/g," "));if(v==="light"||v==="dark")return v}}catch(e){}return null}function setCookie(t){try{var sec=typeof location!=="undefined"&&location.protocol==="https:";document.cookie=ck+"="+encodeURIComponent(t)+"; Path=/; Max-Age=31536000; SameSite=Lax"+(sec?"; Secure":"")}catch(e){}}var fromL=null;try{fromL=localStorage.getItem(lk)}catch(e){}var fromC=readCookie();var t=(fromL==="light"||fromL==="dark")?fromL:((fromC==="light"||fromC==="dark")?fromC:null);if(t){document.documentElement.setAttribute("data-admin-theme",t);try{if(fromL!==t)localStorage.setItem(lk,t)}catch(e){}if(fromC!==t)setCookie(t)}}catch(e){}})();`;
}

/**
 * Admin paneli her zaman istek anında render edilir (oturum / güncel veri).
 * Root layout artık cookie okumadığı için bu ayar burada açıkça veriliyor.
 */
export const dynamic = "force-dynamic";

export default function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const bootScript = adminThemeBootScript();
  return (
    <>
      {/*
        Senkron inline script: HTML parse edilirken, panel içeriği boyanmadan önce çalışır
        ve temayı <html data-admin-theme> olarak uygular (açık/koyu tema flaşını önler).
      */}
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      <Script
        id="admin-theme-boot"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: bootScript }}
      />
      <AdminPanelProviders>{children}</AdminPanelProviders>
    </>
  );
}
