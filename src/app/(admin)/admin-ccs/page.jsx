import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRole } from "@/server/user/user.server";
import { PageContainer } from "@/components/admin/page-container";
import { PageHeader } from "@/components/admin/page-header";
import { CCSStats } from "./_components/CCSStats";
import { CombinedDistributionChart } from "./_components/CombinedDistributionChart";
import { TrendChart } from "./_components/TrendChart";

export const metadata = {
  title: "CCS Dashboard - Centralized Cluster System",
  description: "Analytics and trends for mufaraqah records",
};

export default async function CCSPage() {
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
        title="CCS Dashboard"
        description="Comprehensive analytics and trends for Centralized Cluster System mufaraqah records"
      />

      <div className="space-y-6">
        {/* Statistics Cards */}
        <CCSStats />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Combined Distribution Chart */}
          <CombinedDistributionChart />

          {/* Trend Line Chart */}
          {/* <TrendChart /> */}
        </div>
      </div>
    </PageContainer>
  );
}
