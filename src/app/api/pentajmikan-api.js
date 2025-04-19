"use client";

import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Dynamic imports for server actions
const getAllPentajmikanAction = () =>
  import("@/server/actions/pentajmikan-actions").then(
    (mod) => mod.getAllPentajmikan
  );

const getPentajmikanByIdAction = () =>
  import("@/server/actions/pentajmikan-actions").then(
    (mod) => mod.getPentajmikanById
  );

const createPentajmikanAction = () =>
  import("@/server/actions/pentajmikan-actions").then(
    (mod) => mod.createPentajmikan
  );

const updatePentajmikanAction = () =>
  import("@/server/actions/pentajmikan-actions").then(
    (mod) => mod.updatePentajmikan
  );

const deletePentajmikanAction = () =>
  import("@/server/actions/pentajmikan-actions").then(
    (mod) => mod.deletePentajmikan
  );

const searchUsersAction = () =>
  import("@/server/actions/pentajmikan-actions").then((mod) => mod.searchUsers);

/**
 * Fetch all pentajmikan programs
 */
export async function getAllPentajmikan() {
  const action = await getAllPentajmikanAction();
  const response = await action();

  if (!response.success) {
    console.error("Error fetching pentajmikan programs:", response.error);
    throw new Error(response.error || "Failed to fetch programs");
  }

  return response.data;
}

/**
 * Fetch a pentajmikan program by ID
 * @param {number} id - Program ID
 */
export async function getPentajmikanById(id) {
  const action = await getPentajmikanByIdAction();
  const response = await action(id);

  if (!response.success) {
    console.error(`Error fetching pentajmikan program ${id}:`, response.error);
    throw new Error(response.error || "Failed to fetch program");
  }

  return response.data;
}

/**
 * Create a new pentajmikan program
 * @param {Object} data - Program data
 */
export async function createPentajmikan(data) {
  const action = await createPentajmikanAction();
  const response = await action(data);

  if (!response.success) {
    console.error("Error creating pentajmikan program:", response.error);
    throw new Error(response.error || "Failed to create program");
  }

  return response.data;
}

/**
 * Update a pentajmikan program
 * @param {number} id - Program ID
 * @param {Object} data - Updated program data
 */
export async function updatePentajmikan(id, data) {
  const action = await updatePentajmikanAction();
  const response = await action(id, data);

  if (!response.success) {
    console.error(`Error updating pentajmikan program ${id}:`, response.error);
    throw new Error(response.error || "Failed to update program");
  }

  return response.data;
}

/**
 * Delete a pentajmikan program
 * @param {number} id - Program ID
 */
export async function deletePentajmikan(id) {
  const action = await deletePentajmikanAction();
  const response = await action(id);

  if (!response.success) {
    console.error(`Error deleting pentajmikan program ${id}:`, response.error);
    throw new Error(response.error || "Failed to delete program");
  }

  return response.data;
}

/**
 * Search users for participant selection
 * @param {string} search - Search term
 */
export async function searchUsers(search) {
  try {
    console.log("[API] Searching users with query:", search);
    const action = await searchUsersAction();
    console.log("[API] Got search action function");
    const response = await action(search);
    console.log("[API] Search users response:", response);

    if (!response.success) {
      console.error("[API] Error searching users:", response.error);
      throw new Error(response.error || "Failed to search users");
    }

    if (!response.data || !Array.isArray(response.data)) {
      console.error(
        "[API] Search users response is not an array:",
        response.data
      );
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("[API] Search users error:", error);
    throw error;
  }
}

// React Query hooks
export function useGetAllPentajmikan() {
  return useQuery({
    queryKey: ["pentajmikan"],
    queryFn: getAllPentajmikan,
  });
}

export function useGetPentajmikanById(id) {
  return useQuery({
    queryKey: ["pentajmikan", id],
    queryFn: () => getPentajmikanById(id),
    enabled: !!id,
  });
}

export function useCreatePentajmikan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPentajmikan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pentajmikan"] });
      toast.success("Program created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create program");
    },
  });
}

export function useUpdatePentajmikan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updatePentajmikan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pentajmikan"] });
      queryClient.invalidateQueries({
        queryKey: ["pentajmikan", variables.id],
      });
      toast.success("Program updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update program");
    },
  });
}

export function useDeletePentajmikan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePentajmikan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pentajmikan"] });
      toast.success("Program deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete program");
    },
  });
}
