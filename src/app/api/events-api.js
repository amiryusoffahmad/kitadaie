"use client";

import { useQuery } from "@tanstack/react-query";

// Dynamic imports for server actions to avoid bundling server code in client
const fetchUpcomingEventsAction = () =>
  import("@/server/actions/event-actions").then(
    (mod) => mod.fetchUpcomingEventsAction
  );

const formatEventDate = () =>
  import("@/server/actions/event-actions").then((mod) => mod.formatEventDate);

/**
 * Hook to fetch upcoming events
 * @param {number} limit - Maximum number of events to fetch
 * @returns {Object} - Query result
 */
export function useUpcomingEvents(limit = 5) {
  return useQuery({
    queryKey: ["upcomingEvents", limit],
    queryFn: async () => {
      const action = await fetchUpcomingEventsAction();
      const events = await action(limit);

      // Format dates for display
      const formatDate = await formatEventDate();
      return events.map((event) => ({
        ...event,
        formattedDate: formatDate(event.start_date),
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
