"use client";

import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

let actions;

async function getActions() {
  if (actions) return actions;

  try {
    console.log("[HQ TREE API] Loading server actions...");
    actions = await import("@/server/actions/hq-tree-actions");
    console.log("[HQ TREE API] Server actions loaded successfully");
    return actions;
  } catch (error) {
    console.error("[HQ TREE API] Failed to load server actions:", error);
    throw new Error("Failed to load server actions");
  }
}

/**
 * Hook to get the current user's HQ Tree structure (downlines)
 */
export function useHQTree() {
  return useQuery({
    queryKey: ["hqTree"],
    queryFn: async () => {
      console.log("[HQ TREE API] Fetching HQ Tree data...");
      const actions = await getActions();
      const response = await actions.getHQTree();

      console.log("[HQ TREE API] HQ Tree response received:", response);

      if (!response.success) {
        console.error("[HQ TREE API] Error in response:", response.message);
        throw new Error(response.message || "Failed to fetch HQ Tree data");
      }

      console.log("[HQ TREE API] Returning HQ Tree data:", response.data);
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to get a specific user's profile details
 */
export function useUserProfile(userId) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;

      console.log("[HQ TREE API] Fetching user profile for ID:", userId);
      const actions = await getActions();
      const response = await actions.getUserProfile(userId);

      if (!response.success) {
        console.error(
          "[HQ TREE API] Error fetching user profile:",
          response.message
        );
        throw new Error(response.message || "Failed to fetch user profile");
      }

      console.log("[HQ TREE API] User profile data received for ID:", userId);
      return response.data;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to get all HQs created by the current user
 */
export function useUserHQs() {
  return useQuery({
    queryKey: ["userHQs"],
    queryFn: async () => {
      console.log("[HQ TREE API] Fetching user HQs...");
      const actions = await getActions();
      const response = await actions.getUserHQs();

      if (!response.success) {
        console.error("[HQ TREE API] Error in response:", response.message);
        throw new Error(response.message || "Failed to fetch HQs");
      }

      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get all users assigned to a specific HQ
 */
export function useHQAssignments(hqId) {
  return useQuery({
    queryKey: ["hqAssignments", hqId],
    queryFn: async () => {
      if (!hqId) return [];

      console.log("[HQ TREE API] Fetching HQ assignments for ID:", hqId);
      const actions = await getActions();
      const response = await actions.getHQAssignments(hqId);

      if (!response.success) {
        console.error("[HQ TREE API] Error in response:", response.message);
        throw new Error(response.message || "Failed to fetch HQ assignments");
      }

      return response.data;
    },
    enabled: !!hqId,
  });
}

/**
 * Hook to create a new HQ
 */
export function useCreateHQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name) => {
      console.log("[HQ TREE API] Creating new HQ:", name);
      const actions = await getActions();
      const response = await actions.createHQ(name);

      if (!response.success) {
        console.error("[HQ TREE API] Error creating HQ:", response.message);
        throw new Error(response.message);
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("HQ created successfully");
      // Invalidate the userHQs query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["userHQs"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create HQ");
    },
  });
}

/**
 * Hook to update an existing HQ
 */
export function useUpdateHQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }) => {
      console.log("[HQ TREE API] Updating HQ:", id, name);
      const actions = await getActions();
      const response = await actions.updateHQ(id, name);

      if (!response.success) {
        console.error("[HQ TREE API] Error updating HQ:", response.message);
        throw new Error(response.message);
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("HQ updated successfully");
      // Invalidate the userHQs query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["userHQs"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update HQ");
    },
  });
}

/**
 * Hook to delete an HQ
 */
export function useDeleteHQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      console.log("[HQ TREE API] Deleting HQ:", id);
      const actions = await getActions();
      const response = await actions.deleteHQ(id);

      if (!response.success) {
        console.error("[HQ TREE API] Error deleting HQ:", response.message);
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: () => {
      toast.success("HQ deleted successfully");
      // Invalidate the userHQs query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["userHQs"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete HQ");
    },
  });
}

/**
 * Hook to assign a user to an HQ
 */
export function useAssignUserToHQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hqId, userUsername }) => {
      console.log("[HQ TREE API] Assigning user to HQ:", hqId, userUsername);
      const actions = await getActions();
      const response = await actions.assignUserToHQ(hqId, userUsername);

      if (!response.success) {
        console.error(
          "[HQ TREE API] Error assigning user to HQ:",
          response.message
        );
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: (_, variables) => {
      toast.success("User assigned to HQ successfully");
      // Invalidate the hqAssignments query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["hqAssignments", variables.hqId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign user to HQ");
    },
  });
}

/**
 * Hook to remove a user from an HQ
 */
export function useRemoveUserFromHQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hqId, userUsername }) => {
      console.log("[HQ TREE API] Removing user from HQ:", hqId, userUsername);
      const actions = await getActions();
      const response = await actions.removeUserFromHQ(hqId, userUsername);

      if (!response.success) {
        console.error(
          "[HQ TREE API] Error removing user from HQ:",
          response.message
        );
        throw new Error(response.message);
      }

      return response;
    },
    onSuccess: (_, variables) => {
      toast.success("User removed from HQ successfully");
      // Invalidate the hqAssignments query to refetch the data
      queryClient.invalidateQueries({
        queryKey: ["hqAssignments", variables.hqId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove user from HQ");
    },
  });
}
