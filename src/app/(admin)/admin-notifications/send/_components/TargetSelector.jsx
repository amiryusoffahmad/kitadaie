"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchDepartments, fetchRoles } from "@/server/actions/organizational-actions";
import { UserSelector } from "./UserSelector";

export function TargetSelector({ value, onChange }) {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptResult, roleResult] = await Promise.all([
        fetchDepartments(),
        fetchRoles(),
      ]);

      if (deptResult.success) {
        setDepartments(deptResult.data);
      }

      if (roleResult.success) {
        setRoles(roleResult.data);
      }
    } catch (error) {
      console.error("Failed to load departments/roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetTypeChange = (targetType) => {
    onChange({
      targetType,
      targetDepartmentId: null,
      targetRoleId: null,
      targetUserIds: [],
    });
  };

  const handleDepartmentChange = (departmentId) => {
    onChange({
      ...value,
      targetDepartmentId: parseInt(departmentId),
    });
  };

  const handleRoleChange = (roleId) => {
    onChange({
      ...value,
      targetRoleId: parseInt(roleId),
    });
  };

  const handleUsersChange = (users) => {
    onChange({
      ...value,
      targetUserIds: users,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Target Audience</Label>
        <RadioGroup value={value.targetType} onValueChange={handleTargetTypeChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="everyone" id="everyone" />
            <Label htmlFor="everyone" className="font-normal cursor-pointer">
              Everyone - Send to all users
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="department" id="department" />
            <Label htmlFor="department" className="font-normal cursor-pointer">
              Specific Department
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="role" id="role" />
            <Label htmlFor="role" className="font-normal cursor-pointer">
              Specific Role
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific_users" id="specific_users" />
            <Label htmlFor="specific_users" className="font-normal cursor-pointer">
              Specific Users
            </Label>
          </div>
        </RadioGroup>
      </div>

      {value.targetType === "department" && (
        <div className="space-y-2">
          <Label htmlFor="department-select">
            Select Department <span className="text-destructive">*</span>
          </Label>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={value.targetDepartmentId?.toString()}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger id="department-select">
                <SelectValue placeholder="Choose a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {value.targetType === "role" && (
        <div className="space-y-2">
          <Label htmlFor="role-select">
            Select Role <span className="text-destructive">*</span>
          </Label>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={value.targetRoleId?.toString()}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name} ({role.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {value.targetType === "specific_users" && (
        <div className="space-y-2">
          <UserSelector
            selectedUsers={value.targetUserIds || []}
            onChange={handleUsersChange}
          />
        </div>
      )}
    </div>
  );
}
