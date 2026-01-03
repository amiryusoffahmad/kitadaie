"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import {
  CLUSTER_OPTIONS,
  BRANCH_OPTIONS,
  GENDER_OPTIONS,
  STATUS_MUTAROBBI_OPTIONS,
} from "@/data/ccs-data";

export function TableFilters({ filters, onFilterChange, onResetFilters }) {
  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters =
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.cluster ||
    filters.branch ||
    filters.gender ||
    filters.status;

  return (
    <div className="space-y-4">
      {/* Search and Date Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email..."
            value={filters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Date From */}
        <div>
          <Input
            type="date"
            placeholder="From date"
            value={filters.dateFrom}
            onChange={(e) => handleInputChange("dateFrom", e.target.value)}
          />
        </div>

        {/* Date To */}
        <div>
          <Input
            type="date"
            placeholder="To date"
            value={filters.dateTo}
            onChange={(e) => handleInputChange("dateTo", e.target.value)}
          />
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Cluster Filter */}
        <Select
          value={filters.cluster || "all"}
          onValueChange={(value) =>
            handleInputChange("cluster", value === "all" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Clusters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clusters</SelectItem>
            {CLUSTER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch Filter */}
        <Select
          value={filters.branch || "all"}
          onValueChange={(value) =>
            handleInputChange("branch", value === "all" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {BRANCH_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Gender Filter */}
        <Select
          value={filters.gender || "all"}
          onValueChange={(value) =>
            handleInputChange("gender", value === "all" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Genders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            {GENDER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            handleInputChange("status", value === "all" ? null : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_MUTAROBBI_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
