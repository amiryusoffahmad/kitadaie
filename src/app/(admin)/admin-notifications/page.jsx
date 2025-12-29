import { Suspense } from "react";
import { PageContainer, PageHeader, LoadingState } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, History, TrendingUp } from "lucide-react";
import Link from "next/link";
import { NotificationStats } from "./_components/NotificationStats";
import { RecentNotifications } from "./_components/RecentNotifications";

export const metadata = {
  title: "Notification Center | Admin",
  description: "Send and manage notifications to users",
};

export default function AdminNotificationsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notification Center"
        description="Send, schedule, and manage notifications to users"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Link href="/admin-notifications/send">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Send Notification
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create and send a new notification
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin-notifications/templates">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Manage Templates
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create reusable notification templates
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin-notifications/history">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                View History
              </CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                View sent and scheduled notifications
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Suspense fallback={<LoadingState />}>
        <NotificationStats />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <RecentNotifications />
      </Suspense>
    </PageContainer>
  );
}
