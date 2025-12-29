"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { DataTableWrapper, EmptyState } from "@/components/admin";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  fetchTemplates,
  deleteTemplateAction,
} from "@/server/actions/admin-notification-actions";
import { TemplateDialog } from "./TemplateDialog";

export function TemplatesList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await fetchTemplates();
      if (result.success) {
        setTemplates(result.data);
      } else {
        toast.error(result.message || "Failed to load templates");
      }
    } catch (error) {
      toast.error("An error occurred while loading templates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDeleteClick = (template) => {
    setDeletingTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return;

    try {
      const result = await deleteTemplateAction(deletingTemplate.id);
      if (result.success) {
        toast.success(result.message);
        loadTemplates();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete template");
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingTemplate(null);
    }
  };

  const handleDialogClose = (reload) => {
    setDialogOpen(false);
    setEditingTemplate(null);
    if (reload) {
      loadTemplates();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <>
        <EmptyState
          icon={FileText}
          title="No templates yet"
          description="Create your first notification template to reuse common messages"
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          }
        />
        <TemplateDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          template={editingTemplate}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{template.title}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {template.message}
                </TableCell>
                <TableCell className="text-sm">
                  {template.creator_name || "Unknown"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(template)}
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

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        template={editingTemplate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the template &quot;
              {deletingTemplate?.name}&quot;? This action cannot be undone.
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
