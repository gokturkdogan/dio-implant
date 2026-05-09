"use client";

import type { ReactNode } from "react";
import { AdminToastProvider } from "./admin-toast-provider";

export function AdminPanelProviders({ children }: { children: ReactNode }) {
  return <AdminToastProvider>{children}</AdminToastProvider>;
}
