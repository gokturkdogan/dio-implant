import { AdminLoginClient } from "./ui";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextRaw = sp.next;
  const next =
    typeof nextRaw === "string" && nextRaw.startsWith("/admin-panel")
      ? nextRaw
      : "/admin-panel";

  return <AdminLoginClient nextPath={next} />;
}

