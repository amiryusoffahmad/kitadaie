"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
} from "recharts";
import { Filter, X } from "lucide-react";
import { getClusterDistribution, getCCSStats } from "@/server/actions/ccs-analytics-actions";
import { getClusterColor } from "@/data/ccs-cluster-colors";

const BRANCH_COLORS = {
  Utara: "#FFBC2D",
  Tengah: "#4ECDC4",
  Borneo: "#45B7D1",
  "Pantai Timur": "#96CEB4",
  MEA: "#FD79A8",
  ANZ: "#A29BFE",
  Indonesia: "#74B9FF",
  Afrika: "#FDCB6E",
  Europe: "#55EFC4",
};

const CustomTreemapContent = ({ x, y, width, height, name, value, color }) => {
  const fontSize = Math.max(10, Math.min(14, width / 10));
  const showLabel = width > 60 && height > 40;
  const displayName = name ? name.replace(/^\d+\.\s*/, "").substring(0, 15) : "";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: "#fff",
          strokeWidth: 2,
          opacity: 0.9,
        }}
      />
      {showLabel && name && value && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 5}
            textAnchor="middle"
            fill="#fff"
            fontSize={fontSize}
            fontWeight="600"
          >
            {value}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + fontSize + 5}
            textAnchor="middle"
            fill="#fff"
            fontSize={Math.max(8, fontSize - 2)}
            opacity={0.9}
          >
            {displayName}
          </text>
        </>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
        <p className="font-semibold text-popover-foreground">
          {data.name || data.branch}
        </p>
        <p className="text-sm text-muted-foreground">
          Count: <span className="font-bold text-foreground">{data.value || data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function CombinedDistributionChart() {
  const [clusterData, setClusterData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hasFilter, setHasFilter] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (filters = {}) => {
    setLoading(true);
    try {
      // Load cluster distribution with filters
      const clusterResult = await getClusterDistribution(filters);
      if (clusterResult.success) {
        const chartData = clusterResult.data.distribution.map((item) => ({
          name: item.sebab_utama,
          value: item.count,
          color: getClusterColor(item.sebab_utama),
        }));
        setClusterData(chartData);
      }

      // Load branch distribution with filters
      const statsResult = await getCCSStats(filters);
      if (statsResult.success) {
        const branchChartData = statsResult.data.branches.map((item, index) => ({
          branch: item.murobbi_branch,
          count: item.count,
          x: index + 1,
          y: item.count,
          z: item.count,
          color: BRANCH_COLORS[item.murobbi_branch] || "#95A5A6",
        }));
        setBranchData(branchChartData);
      }
    } catch (error) {
      console.error("Failed to load distribution data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (dateFrom || dateTo) {
      setHasFilter(true);
      loadData({ dateFrom, dateTo });
    }
  };

  const handleClearFilter = () => {
    setDateFrom("");
    setDateTo("");
    setHasFilter(false);
    loadData();
  };

  if (loading) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribution Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-125 flex items-center justify-center">
            <div className="grid w-full grid-cols-2 gap-4">
              <div className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="mx-auto size-32 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">Distribution Analysis</CardTitle>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-35 h-9 text-sm"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-35 h-9 text-sm"
              placeholder="To"
            />
            <Button
              onClick={handleApplyFilter}
              size="sm"
              variant="default"
              className="h-9"
            >
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filter
            </Button>
            {hasFilter && (
              <Button
                onClick={handleClearFilter}
                size="sm"
                variant="outline"
                className="h-9"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cluster Treemap */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Cluster Distribution
            </h3>
            <div className="h-100">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={clusterData}
                  dataKey="value"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<CustomTreemapContent />}
                >
                  <Tooltip content={<CustomTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Branch Bubble Chart */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Branch Distribution
            </h3>
            <div className="h-85">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="y" hide />
                  <ZAxis type="number" dataKey="z" range={[400, 4000]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={branchData} fill="#8884d8">
                    {branchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Branch Legend */}
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              {branchData.map((branch, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: branch.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {branch.branch} ({branch.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
