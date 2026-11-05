"use client";

import AppLoadingSkeleton from "@/components/app-loading-skeleton"
import { useState, useEffect } from "react";
import { fetchRoles, deleteRoleAction } from "@/server/actions/organizational-actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, MessageSquare, Shield } from "lucide-react";
import { toast } from "sonner";
import { RoleDialog } from "./RoleDialog";
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

export function RolesList() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const result = await fetchRoles();
      if (result.success) {
        setRoles(result.data);
      } else {
        toast.error(result.message || "Failed to load roles");
      }
    } catch (error) {
      toast.error("An error occurred while loading roles");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDeleteClick = (role) => {
    setDeletingRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;

    try {
      const result = await deleteRoleAction(deletingRole.id);
      if (result.success) {
        toast.success(result.message);
        loadRoles();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete role");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingRole(null);
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setEditingRole(null);
    if (refresh) {
      loadRoles();
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
            Add Role
          </Button>
        </div>

        {roles.length === 0 ? (
          <DataTableWrapper>
            <EmptyState
              icon={Shield}
              title="No roles yet"
              description="Roles should be seeded during migration"
              action={
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Role
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
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {role.telegram_group_id ? (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-mono">
                            {role.telegram_group_id}
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
                          onClick={() => handleEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(role)}
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

      <RoleDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        role={editingRole}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingRole?.name}</strong>?
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
