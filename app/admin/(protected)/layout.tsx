import { databaseEnabled } from "@/lib/runtime-config";
import { redirect } from "next/navigation";
import { admin, HttpError } from "@/lib/security";
import { AdminShell } from "@/components/admin/AdminShell";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await admin();
  } catch (error) {
    if (error instanceof HttpError && error.status === 401)
      redirect("/admin/login");
    if (!databaseEnabled()) redirect("/admin/login");
    throw error;
  }
  return <AdminShell>{children}</AdminShell>;
}
