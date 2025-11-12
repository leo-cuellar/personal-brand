import { useState, useCallback } from "react";
import { getPosts as getPostsWrapper, updatePost as updatePostWrapper, schedulePost as schedulePostWrapper, deletePost as deletePostWrapper } from "@/services/api-wrapper/late";
import type {
    LateGetPostsParams,
    LateGetPostsResponse,
    LateUpdatePostRequest,
    LateSchedulePostRequest,
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
    schedulePost: (
        postId: string,
        scheduleData: LateSchedulePostRequest
    ) => Promise<LatePost>;
    deletePost: (postId: string) => Promise<void>;
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

    const schedulePost = useCallback(
        async (postId: string, scheduleData: LateSchedulePostRequest) => {
            setLoading(true);
            setError(null);

            try {
                const data = await schedulePostWrapper(postId, scheduleData);
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to schedule post";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deletePost = useCallback(
        async (postId: string) => {
            setLoading(true);
            setError(null);

            try {
                await deletePostWrapper(postId);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete post";
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
        schedulePost,
        deletePost,
        loading,
        error,
    };
}

