"use client";

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useState, useEffect } from "react";
import { fetchDepartments, deleteDepartmentAction } from "@/server/actions/organizational-actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, MessageSquare, Building2 } from "lucide-react";
import { toast } from "sonner";
import { DepartmentDialog } from "./DepartmentDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState, DataTableWrapper, LoadingText } from "@/components/admin";

export function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState(null);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const result = await fetchDepartments();
      if (result.success) {
        setDepartments(result.data);
      } else {
        toast.error(result.message || "Failed to load departments");
      }
    } catch (error) {
      toast.error("An error occurred while loading departments");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = () => {
    setEditingDepartment(null);
    setDialogOpen(true);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setDialogOpen(true);
  };

  const handleDeleteClick = (department) => {
    setDeletingDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDepartment) return;

    try {
      const result = await deleteDepartmentAction(deletingDepartment.id);
      if (result.success) {
        toast.success(result.message);
        loadDepartments();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete department");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingDepartment(null);
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setEditingDepartment(null);
    if (refresh) {
      loadDepartments();
    }
  };

  if (isLoading) {
    return <AppLoadingSkeleton />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {departments.length === 0 ? (
          <DataTableWrapper>
            <EmptyState
              icon={Building2}
              title="No departments yet"
              description="Create your first department to get started"
              action={
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              }
            />
          </DataTableWrapper>
        ) : (
          <DataTableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Telegram Group</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{department.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {department.telegram_group_id ? (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-mono">
                            {department.telegram_group_id}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not configured</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(department)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(department)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTableWrapper>
        )}
      </div>

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        department={editingDepartment}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingDepartment?.name}</strong>?
              This action cannot be undone and will fail if there are existing user assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
