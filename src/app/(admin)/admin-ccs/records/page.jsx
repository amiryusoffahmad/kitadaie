import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRole } from "@/server/user/user.server";
import { PageContainer } from "@/components/admin/page-container";
import { PageHeader } from "@/components/admin/page-header";
import { MufaraqahTable } from "./_components/MufaraqahTable";

export const metadata = {
  title: "Mufaraqah Records - CCS",
  description: "View and manage all mufaraqah records",
};

export default async function MufaraqahRecordsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const data = await getRole(session.user.id);
  if (data.role !== "admin") {
    redirect("/home");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Mufaraqah Records"
        description="Comprehensive table of all mufaraqah records with advanced filtering and export capabilities"
      />

      <MufaraqahTable />
    </PageContainer>
  );
}
