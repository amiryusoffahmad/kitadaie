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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { getMufaraqahTrend } from "@/server/actions/ccs-analytics-actions";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
        <p className="font-semibold text-popover-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Mufaraqah:{" "}
          <span className="font-bold text-foreground">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const formatPeriodLabel = (period, periodType, weekStart) => {
  if (periodType === "weekly" && weekStart) {
    // Format: "Week of Jan 1, 2024"
    const date = new Date(weekStart);
    return `Week of ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  } else {
    // Format: "Jan 2024"
    const [year, month] = period.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }
};

export function TrendChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getMufaraqahTrend(period);
      if (result.success) {
        // Transform data for Recharts
        const chartData = result.data.map((item) => ({
          period: item.period,
          weekStart: item.week_start,
          count: item.count,
          label: formatPeriodLabel(item.period, period, item.week_start),
        }));

        setData(chartData);
      }
    } catch (error) {
      console.error("Failed to load trend data:", error);
    } finally {
      setLoading(false);
    }
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const average = data.length > 0 ? (total / data.length).toFixed(1) : 0;

  if (loading) {
    return (
      <Card className="relative overflow-hidden border shadow-md">
        <div className="absolute inset-0 bg-accent/5" />
        <CardHeader className="pb-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">
                Mufaraqah Trend
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Loading...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="h-75 flex items-center justify-center">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold">
              Mufaraqah Trend
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Average: {average} per {period === "monthly" ? "month" : "week"}{" "}
              | Total: {total}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-35">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-75">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="label"
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
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
                formatter={() => (
                  <span className="text-sm font-medium text-muted-foreground">
                    Mufaraqah Count
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#FFBC2D"
                strokeWidth={3}
                dot={{ fill: "#FFBC2D", r: 4 }}
                activeDot={{ r: 6, stroke: "#FFBC2D", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
