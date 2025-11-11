import { useState, useCallback } from "react";
import { getPosts as getPostsWrapper } from "@/services/api-wrapper/late";
import type {
    LateGetPostsParams,
    LateGetPostsResponse,
} from "@/services/late/posts";

interface UseLateReturn {
    getPosts: (
        params?: LateGetPostsParams
    ) => Promise<LateGetPostsResponse>;
    loading: boolean;
    error: string | null;
}

export function useLate(): UseLateReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPosts = useCallback(
        async (params?: LateGetPostsParams) => {
            setLoading(true);
            setError(null);

            try {
                const data = await getPostsWrapper(params);
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to get posts";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        getPosts,
        loading,
        error,
    };
}

