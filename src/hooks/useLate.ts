import { useState, useCallback } from "react";
import { getPosts as getPostsWrapper, updatePost as updatePostWrapper, schedulePost as schedulePostWrapper, deletePost as deletePostWrapper, updateQueueSlots as updateQueueSlotsWrapper, getQueueSlots as getQueueSlotsWrapper, deleteQueueSlots as deleteQueueSlotsWrapper, getNextSlot as getNextSlotWrapper, addPostToQueue as addPostToQueueWrapper } from "../../services/api-wrapper/late";
import type {
    LateGetPostsParams,
    LateGetPostsResponse,
    LateUpdatePostRequest,
    LateSchedulePostRequest,
    LatePost,
} from "../../services/late/posts";
import type {
    UpdateQueueSlotsRequest,
    QueueSlotsResponse,
    GetQueueSlotsResponse,
    DeleteQueueSlotsResponse,
    NextSlotResponse,
} from "../../services/late/queue";

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
    updateQueueSlots: (
        requestData: UpdateQueueSlotsRequest
    ) => Promise<QueueSlotsResponse>;
    getQueueSlots: (
        profileId?: string
    ) => Promise<GetQueueSlotsResponse>;
    deleteQueueSlots: (
        profileId?: string
    ) => Promise<DeleteQueueSlotsResponse>;
    getNextSlot: () => Promise<NextSlotResponse>;
    addPostToQueue: (
        postId: string
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

    const updateQueueSlots = useCallback(
        async (requestData: UpdateQueueSlotsRequest) => {
            setLoading(true);
            setError(null);

            try {
                const data = await updateQueueSlotsWrapper(requestData);
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to update queue slots";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getQueueSlots = useCallback(
        async (profileId?: string) => {
            setLoading(true);
            setError(null);

            try {
                const data = await getQueueSlotsWrapper(profileId);
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to get queue slots";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deleteQueueSlots = useCallback(
        async (profileId?: string) => {
            setLoading(true);
            setError(null);

            try {
                const data = await deleteQueueSlotsWrapper(profileId);
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to delete queue slots";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getNextSlot = useCallback(
        async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getNextSlotWrapper();
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to get next slot";
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const addPostToQueue = useCallback(
        async (postId: string) => {
            setLoading(true);
            setError(null);

            try {
                const data = await addPostToQueueWrapper(postId);
                return data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to add post to queue";
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
        updateQueueSlots,
        getQueueSlots,
        deleteQueueSlots,
        getNextSlot,
        addPostToQueue,
        loading,
        error,
    };
}

