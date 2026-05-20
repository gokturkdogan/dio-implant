import { AdminCompleteUserSetupClient } from "./ui";

export const metadata = {
  title: "Hesap oluştur | Yönetim Paneli | DIO Implant",
};

export default async function AdminCompleteUserSetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tokenRaw = sp.token;
  const token = typeof tokenRaw === "string" ? tokenRaw : "";

  return <AdminCompleteUserSetupClient token={token} />;
}
