import { PageContainer, PageHeader } from "@/components/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export const metadata = {
  title: "Dashboard | Admin",
  description: "Admin dashboard overview",
};

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your administrative workspace"
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Activity className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">Dashboard Coming Soon</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            This dashboard is currently in development. Check back soon for analytics and insights.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
