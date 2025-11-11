import { useState, useCallback } from "react";
import type { LateSchedulePostResponse } from "@/services/api-wrapper/late";

interface UseLateReturn {
    schedulePublication: (
        text: string,
        schedule?: string
    ) => Promise<{ latePost: LateSchedulePostResponse }>;
    loading: boolean;
    error: string | null;
}

export function useLate(): UseLateReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const schedulePublication = useCallback(
        async (
            text: string,
            schedule?: string
        ) => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/late/schedule", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        text,
                        schedule,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to schedule publication");
                }

                const data = await response.json();
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to schedule publication";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        schedulePublication,
        loading,
        error,
    };
}

