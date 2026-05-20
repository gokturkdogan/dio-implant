import type { UserRole } from "@/db/schema/user";

/** Panel listesi — `password_hash` dahil değil. */
export type AdminUserListItem = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};
