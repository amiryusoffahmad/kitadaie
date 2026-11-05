"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { getCCSSubmissionsPaginated } from "@/server/actions/ccs-analytics-actions";
import { TableFilters } from "./TableFilters";
import { PaginationControls } from "./PaginationControls";
import { ExportButton } from "./ExportButton";
import { RecordDetailDialog } from "./RecordDetailDialog";

const initialFilters = {
  search: "",
  dateFrom: null,
  dateTo: null,
  cluster: null,
  branch: null,
  gender: null,
  status: null,
};

const initialPagination = {
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0,
};

export function MufaraqahTable() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy] = useState("created_at");
  const [sortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.limit, filters, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getCCSSubmissionsPaginated({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        sortBy,
        sortOrder,
      });

      if (result.success) {
        setSubmissions(result.data.submissions);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getGenderBadgeVariant = (gender) => {
    return gender === "Ikhwah" ? "default" : "secondary";
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Mufaraqah":
        return "destructive";
      case "Dibuang":
        return "destructive";
      case "Diturunkan":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4 grid grid-cols-1">
      {/* Filters and Export */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filters</h2>
              <ExportButton filters={filters} />
            </div>
            <TableFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full">
            {loading && (
              <div
                role="status"
                aria-label="Loading records"
                className="absolute inset-0 z-10 grid content-start gap-4 bg-background/80 p-6 backdrop-blur-sm"
              >
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                ))}
              </div>
            )}

            <div className="w-full overflow-x-auto">
              <Table className="w-full"
                style={{ minWidth: "1200px" }}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead className="min-w-50">
                      Mutarobbi Name
                    </TableHead>
                    <TableHead className="min-w-50">Murobbi</TableHead>
                    <TableHead className="w-25">Gender</TableHead>
                    <TableHead className="w-25">Branch</TableHead>
                    <TableHead className="min-w-62.5">Sebab Utama</TableHead>
                    <TableHead className="w-32.5">Tarikh</TableHead>
                    <TableHead className="w-30">Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-64 text-center text-muted-foreground"
                      >
                        {loading ? (
                          <Skeleton className="mx-auto h-5 w-40" />
                        ) : (
                          "No records found matching your criteria"
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {record.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {record.mutarobbi_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {record.murobbi_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {record.murobbi_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getGenderBadgeVariant(record.mutarobbi_gender)}>
                            {record.mutarobbi_gender}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.murobbi_branch}</TableCell>
                        <TableCell>
                          <div className="max-w-62.5 truncate" title={record.sebab_utama}>
                            {record.sebab_utama}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(record.tarikh_mufaraqah)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(record.mutarobbi_status)}>
                            {record.mutarobbi_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {submissions.length > 0 && (
            <div className="border-t px-6">
              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <RecordDetailDialog
        record={selectedRecord}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
