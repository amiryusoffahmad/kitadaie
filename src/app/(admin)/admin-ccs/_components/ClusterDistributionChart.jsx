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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChartIcon } from "lucide-react";
import { getClusterDistribution } from "@/server/actions/ccs-analytics-actions";
import { getClusterColor, getClusterLabel } from "@/data/ccs-cluster-colors";

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.05) return null; // Don't show labels for very small segments

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-bold drop-shadow-lg"
      style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
        <p className="font-semibold text-popover-foreground">
          {getClusterLabel(payload[0].name)}
        </p>
        <p className="text-sm text-muted-foreground">
          Count:{" "}
          <span className="font-bold text-foreground">{payload[0].value}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Percentage:{" "}
          <span className="font-bold text-foreground">
            {((payload[0].percent || 0) * 100).toFixed(1)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export function ClusterDistributionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await getClusterDistribution();
      if (result.success) {
        // Transform data for Recharts with colors
        const chartData = result.data.distribution.map((item) => ({
          name: item.sebab_utama,
          value: item.count,
          color: getClusterColor(item.sebab_utama),
        }));

        setData(chartData);
        setTotal(chartData.reduce((sum, item) => sum + item.value, 0));
      }
    } catch (error) {
      console.error("Failed to load cluster distribution:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden border shadow-md">
        <div className="absolute inset-0 bg-accent/5" />
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                Cluster Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Loading...
              </CardDescription>
            </div>
            <div className="p-3 rounded-full bg-accent text-accent-foreground shadow">
              <PieChartIcon className="h-5 w-5" />
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
              Cluster Distribution
            </CardTitle>
            <CardDescription className="text-3xl font-bold text-foreground mt-1">
              {total.toLocaleString()}{" "}
              <span className="text-lg font-medium text-muted-foreground">
                records
              </span>
            </CardDescription>
          </div>
          <div className="p-3 rounded-full bg-accent text-accent-foreground shadow">
            <PieChartIcon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={110}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                stroke="var(--background)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-90 transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={60}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (
                  <span className="text-xs font-medium text-muted-foreground">
                    {getClusterLabel(value)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
