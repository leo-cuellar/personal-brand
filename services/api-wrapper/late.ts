/**
 * Late.dev API Wrapper
 * Wraps calls to our internal API routes for Late.dev
 */

import type {
    LateGetPostsParams,
    LateGetPostsResponse,
    LateUpdatePostRequest,
    LateSchedulePostRequest,
    LatePost,
} from "../late/posts";
import type {
    UpdateQueueSlotsRequest,
    QueueSlotsResponse,
    GetQueueSlotsResponse,
    DeleteQueueSlotsResponse,
    NextSlotResponse,
} from "../late/queue";

/**
 * Get posts from Late.dev via our API route
 */
export async function getPosts(
    params: LateGetPostsParams = {}
): Promise<LateGetPostsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) {
        queryParams.append("page", params.page.toString());
    }
    if (params.limit !== undefined) {
        queryParams.append("limit", params.limit.toString());
    }
    if (params.status) {
        queryParams.append("status", params.status);
    }
    if (params.platform) {
        queryParams.append("platform", params.platform);
    }
    if (params.profileId) {
        queryParams.append("profileId", params.profileId);
    }
    if (params.createdBy) {
        queryParams.append("createdBy", params.createdBy);
    }
    if (params.dateFrom) {
        queryParams.append("dateFrom", params.dateFrom);
    }
    if (params.dateTo) {
        queryParams.append("dateTo", params.dateTo);
    }
    if (params.includeHidden !== undefined) {
        queryParams.append("includeHidden", params.includeHidden.toString());
    }

    const queryString = queryParams.toString();
    const url = `/api/late/posts${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get posts");
    }

    const data: LateGetPostsResponse = await response.json();
    return data;
}

/**
 * Update a post in Late.dev via our API route
 */
export async function updatePost(
    postId: string,
    updates: LateUpdatePostRequest
): Promise<LatePost> {
    const url = `/api/late/posts/${postId}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
    }

    const data: LatePost = await response.json();
    return data;
}

/**
 * Schedule a post in Late.dev via our API route
 * Uses PUT to update the post with scheduledFor, timezone, and platforms
 */
export async function schedulePost(
    postId: string,
    scheduleData: LateSchedulePostRequest
): Promise<LatePost> {
    // Call PUT endpoint - the API route will detect it's a schedule request
    // and call schedulePost service which adds platforms with accountId
    const url = `/api/late/posts/${postId}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to schedule post");
    }

    const data: LatePost = await response.json();
    return data;
}

/**
 * Delete a post in Late.dev via our API route
 */
export async function deletePost(postId: string): Promise<void> {
    const url = `/api/late/posts/${postId}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
    }
}

/**
 * Update queue slots in Late.dev via our API route
 */
export async function updateQueueSlots(
    requestData: UpdateQueueSlotsRequest
): Promise<QueueSlotsResponse> {
    const response = await fetch("/api/late/queue", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update queue slots");
    }

    const data: QueueSlotsResponse = await response.json();
    return data;
}

/**
 * Get queue slots configuration from Late.dev via our API route
 */
export async function getQueueSlots(
    profileId?: string
): Promise<GetQueueSlotsResponse> {
    const queryParams = new URLSearchParams();
    if (profileId) {
        queryParams.append("profileId", profileId);
    }

    const url = `/api/late/queue${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get queue slots");
    }

    const data: GetQueueSlotsResponse = await response.json();
    return data;
}

/**
 * Delete queue slots configuration from Late.dev via our API route
 */
export async function deleteQueueSlots(
    profileId?: string
): Promise<DeleteQueueSlotsResponse> {
    const queryParams = new URLSearchParams();
    if (profileId) {
        queryParams.append("profileId", profileId);
    }

    const url = `/api/late/queue${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete queue slots");
    }

    const data: DeleteQueueSlotsResponse = await response.json();
    return data;
}

/**
 * Get next available slot from queue via our API route
 * Always uses LATE_PROFILE_ID from environment variables (ignores profileId parameter)
 */
export async function getNextSlot(): Promise<NextSlotResponse> {
    const url = `/api/late/queue/next-slot`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get next slot");
    }

    const data: NextSlotResponse = await response.json();
    return data;
}

/**
 * Add post to queue - calls API endpoint that handles getting next slot and scheduling internally
 * Always uses LATE_PROFILE_ID from environment variables (handled server-side)
 */
export async function addPostToQueue(
    postId: string
): Promise<LatePost> {
    const url = `/api/late/posts/${postId}/add-to-queue`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add post to queue");
    }

    const data: LatePost = await response.json();
    return data;
}

