"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

export function NavbarShell() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin-panel")) {
    return null;
  }

  return <Navbar />;
}

