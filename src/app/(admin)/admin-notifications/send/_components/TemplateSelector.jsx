"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { fetchTemplates } from "@/server/actions/admin-notification-actions";

export function TemplateSelector({ onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await fetchTemplates();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (templateId) => {
    if (templateId === "none") {
      onSelect(null);
      return;
    }

    const template = templates.find((t) => t.id === parseInt(templateId));
    if (template) {
      onSelect(template);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Use Template (Optional)</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading templates..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>Use Template (Optional)</Label>
      <Select onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template or compose from scratch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None - Compose from scratch</SelectItem>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id.toString()}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select a template to auto-fill title and message
      </p>
    </div>
  );
}
