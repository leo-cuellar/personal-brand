import { useState, useCallback } from "react";
import { getPosts as getPostsWrapper, updatePost as updatePostWrapper } from "@/services/api-wrapper/late";
import type {
    LateGetPostsParams,
    LateGetPostsResponse,
    LateUpdatePostRequest,
    LatePost,
} from "@/services/late/posts";

interface UseLateReturn {
    getPosts: (
        params?: LateGetPostsParams
    ) => Promise<LateGetPostsResponse>;
    updatePost: (
        postId: string,
        updates: LateUpdatePostRequest
    ) => Promise<LatePost>;
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

    const updatePost = useCallback(
        async (postId: string, updates: LateUpdatePostRequest) => {
            setLoading(true);
            setError(null);

            try {
                const data = await updatePostWrapper(postId, updates);
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update post";
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
        updatePost,
        loading,
        error,
    };
}

