"use client";

/**
 * Client-side API functions for user profile
 * These functions act as wrappers around server actions to be used safely in client components
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";

// Dynamic imports for server actions to avoid bundling server code in client
const fetchPersonalDataAction = () =>
  import("@/server/actions/personal-actions").then(
    (mod) => mod.fetchPersonalDataAction
  );
const updatePersonalDataAction = () =>
  import("@/server/actions/personal-actions").then(
    (mod) => mod.updatePersonalDataAction
  );

// Dynamic imports for education server actions
const fetchEducationDataAction = () =>
  import("@/server/actions/education-actions").then(
    (mod) => mod.fetchEducationDataAction
  );
const updateEducationDataAction = () =>
  import("@/server/actions/education-actions").then(
    (mod) => mod.updateEducationDataAction
  );
const deleteEducationAction = () =>
  import("@/server/actions/education-actions").then(
    (mod) => mod.deleteEducationAction
  );

// Dynamic imports for high school server actions
const fetchHighSchoolDataAction = () =>
  import("@/server/actions/high-school-actions").then(
    (mod) => mod.fetchHighSchoolDataAction
  );
const updateHighSchoolDataAction = () =>
  import("@/server/actions/high-school-actions").then(
    (mod) => mod.updateHighSchoolDataAction
  );
const deleteHighSchoolAction = () =>
  import("@/server/actions/high-school-actions").then(
    (mod) => mod.deleteHighSchoolAction
  );

// Dynamic imports for certification server actions
const fetchCertificationDataAction = () =>
  import("@/server/actions/certification-actions").then(
    (mod) => mod.fetchCertificationDataAction
  );
const updateCertificationAction = () =>
  import("@/server/actions/certification-actions").then(
    (mod) => mod.updateCertificationAction
  );
const deleteCertificationAction = () =>
  import("@/server/actions/certification-actions").then(
    (mod) => mod.deleteCertificationAction
  );

// Dynamic imports for family server actions
const fetchFamilyDataAction = () =>
  import("@/server/actions/family-actions").then(
    (mod) => mod.fetchFamilyDataAction
  );
const updateFamilyAction = () =>
  import("@/server/actions/family-actions").then(
    (mod) => mod.updateFamilyAction
  );
const deleteFamilyAction = () =>
  import("@/server/actions/family-actions").then(
    (mod) => mod.deleteFamilyAction
  );

/**
 * Hook to get the current user ID from Better Auth session
 */
export function useCurrentUserId() {
  const { data: session, isPending, error } = useSession();

  return {
    data: session?.user?.id || null,
    isLoading: isPending,
    error: error,
  };
}

/**
 * Hook to get personal data for a user
 */
export function usePersonalData(userId) {
  return useQuery({
    queryKey: ["personalData", userId],
    queryFn: async () => {
      if (!userId) return null;
      const action = await fetchPersonalDataAction();
      return action(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to update personal data
 */
export function useUpdatePersonalData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, userId }) => {
      const action = await updatePersonalDataAction();
      return action(data, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch personal data after successful update
      queryClient.invalidateQueries({ queryKey: ["personalData", userId] });
    },
  });
}

/**
 * Hook to get education data for a user
 */
export function useEducationData(userId) {
  return useQuery({
    queryKey: ["educationData", userId],
    queryFn: async () => {
      if (!userId) return [];
      const action = await fetchEducationDataAction();
      return action(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to add or update education data
 */
export function useUpdateEducationData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, userId }) => {
      const action = await updateEducationDataAction();
      return action(data, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch education data after successful update
      queryClient.invalidateQueries({ queryKey: ["educationData", userId] });
    },
  });
}

/**
 * Hook to delete education entry
 */
export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ educationId, userId }) => {
      const action = await deleteEducationAction();
      return action(educationId, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch education data after successful deletion
      queryClient.invalidateQueries({ queryKey: ["educationData", userId] });
    },
  });
}

/**
 * Hook to get high school data for a user
 */
export function useHighSchoolData(userId) {
  return useQuery({
    queryKey: ["highSchoolData", userId],
    queryFn: async () => {
      if (!userId) return null;
      const action = await fetchHighSchoolDataAction();
      return action(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to update high school data
 */
export function useUpdateHighSchoolData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, userId }) => {
      const action = await updateHighSchoolDataAction();
      return action(data, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch high school data after successful update
      queryClient.invalidateQueries({ queryKey: ["highSchoolData", userId] });
    },
  });
}

/**
 * Hook to delete high school entry
 */
export function useDeleteHighSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ highSchoolId, userId }) => {
      const action = await deleteHighSchoolAction();
      return action(highSchoolId, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch high school data after successful deletion
      queryClient.invalidateQueries({ queryKey: ["highSchoolData", userId] });
    },
  });
}

/**
 * Hook to get certification data for a user
 */
export function useCertificationData(userId) {
  return useQuery({
    queryKey: ["certificationData", userId],
    queryFn: async () => {
      if (!userId) return [];
      const action = await fetchCertificationDataAction();
      return action(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to add or update certification data
 */
export function useUpdateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, userId }) => {
      const action = await updateCertificationAction();
      return action(data, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch certification data after successful update
      queryClient.invalidateQueries({
        queryKey: ["certificationData", userId],
      });
    },
  });
}

/**
 * Hook to delete certification entry
 */
export function useDeleteCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ certificationId, userId }) => {
      const action = await deleteCertificationAction();
      return action(certificationId, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch certification data after successful deletion
      queryClient.invalidateQueries({
        queryKey: ["certificationData", userId],
      });
    },
  });
}

/**
 * Hook to get family data for a user
 */
export function useFamilyData(userId) {
  return useQuery({
    queryKey: ["familyData", userId],
    queryFn: async () => {
      if (!userId) return [];
      const action = await fetchFamilyDataAction();
      return action(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook to add or update family data
 */
export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, userId }) => {
      const action = await updateFamilyAction();
      return action(data, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch family data after successful update
      queryClient.invalidateQueries({ queryKey: ["familyData", userId] });
    },
  });
}

/**
 * Hook to delete family entry
 */
export function useDeleteFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ familyId, userId }) => {
      const action = await deleteFamilyAction();
      return action(familyId, userId);
    },
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch family data after successful deletion
      queryClient.invalidateQueries({ queryKey: ["familyData", userId] });
    },
  });
}
