import type { Metadata } from "next";
import { MaintenanceView } from "@/components/maintenance/maintenance-view";

export const metadata: Metadata = {
  title: "Bakım Modu | DIO Implant",
  description:
    "Sitemiz kısa süreli bakım çalışması nedeniyle geçici olarak kapalıdır.",
};

export default function MaintenancePage() {
  return <MaintenanceView />;
}
