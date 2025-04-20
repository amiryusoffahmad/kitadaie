"use client";

import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

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
