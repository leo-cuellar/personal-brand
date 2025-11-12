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
} from "@/services/late/posts";

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

