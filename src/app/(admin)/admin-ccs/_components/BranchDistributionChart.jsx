"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Building2 } from "lucide-react";
import { getCCSStats } from "@/server/actions/ccs-analytics-actions";

const BRANCH_COLORS = {
  TDU: "#FFBC2D", // Amber
  TMA: "#4ECDC4", // Teal
  TDS: "#45B7D1", // Blue
  TDD: "#96CEB4", // Green
  TDJ: "#FD79A8", // Pink
  TDP: "#A29BFE", // Purple
  TDB: "#74B9FF", // Sky Blue
  TDK: "#FDCB6E", // Orange
  TDSS: "#55EFC4", // Mint
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
        <p className="font-semibold text-popover-foreground">
          {payload[0].payload.branch}
        </p>
        <p className="text-sm text-muted-foreground">
          Count:{" "}
          <span className="font-bold text-foreground">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function BranchDistributionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await getCCSStats();
      if (result.success) {
        // Transform branch data for chart
        const chartData = result.data.branches.map((item) => ({
          branch: item.murobbi_branch,
          count: item.count,
          color: BRANCH_COLORS[item.murobbi_branch] || "#95A5A6",
        }));

        setData(chartData);
      }
    } catch (error) {
      console.error("Failed to load branch distribution:", error);
    } finally {
      setLoading(false);
    }
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <Card className="relative overflow-hidden border shadow-md">
        <div className="absolute inset-0 bg-accent/5" />
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                Branch Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Loading...
              </CardDescription>
            </div>
            <div className="p-3 rounded-full bg-accent text-accent-foreground shadow">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading chart...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-accent/5" />
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">
              Branch Distribution
            </CardTitle>
            <CardDescription className="text-3xl font-bold text-foreground mt-1">
              {total.toLocaleString()}{" "}
              <span className="text-lg font-medium text-muted-foreground">
                across branches
              </span>
            </CardDescription>
          </div>
          <div className="p-3 rounded-full bg-accent text-accent-foreground shadow">
            <Building2 className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="branch"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
