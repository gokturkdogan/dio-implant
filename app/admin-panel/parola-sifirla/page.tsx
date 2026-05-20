import { AdminResetPasswordClient } from "./ui";

export const metadata = {
  title: "Parola sıfırla | Yönetim Paneli | DIO Implant",
};

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tokenRaw = sp.token;
  const token = typeof tokenRaw === "string" ? tokenRaw : "";

  return <AdminResetPasswordClient token={token} />;
}
