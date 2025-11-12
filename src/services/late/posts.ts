/**
 * Late.dev Posts Service
 * Handles direct API calls to Late.dev for posts management
 * This service should only be called from server-side code (API routes)
 */

export interface LatePost {
    _id: string;
    userId: {
        name: string;
        id: string;
    };
    title?: string;
    content: string;
    mediaItems: unknown[];
    platforms: unknown[];
    scheduledFor?: string;
    timezone?: string;
    status: "draft" | "scheduled" | "published" | "failed";
    tags: string[];
    hashtags: string[];
    mentions: string[];
    visibility: string;
    crosspostingEnabled: boolean;
    analytics: {
        impressions: number;
        reach: number;
        likes: number;
        comments: number;
        shares: number;
        clicks: number;
        views: number;
    };
    metadata: Record<string, unknown>;
    publishAttempts: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface LateGetPostsParams {
    page?: number;
    limit?: number;
    status?: "draft" | "scheduled" | "published" | "failed";
    platform?: string;
    profileId?: string;
    createdBy?: string;
    dateFrom?: string; // ISO datetime
    dateTo?: string; // ISO datetime
    includeHidden?: boolean;
}

export interface LateGetPostsResponse {
    posts: LatePost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface LateUpdatePostRequest {
    title?: string;
    content?: string;
    scheduledFor?: string;
    timezone?: string;
    platforms?: Array<{
        accountId: string;
        platform?: string;
        customContent?: string;
    }>;
    isDraft?: boolean;
    publishNow?: boolean;
    status?: "draft" | "scheduled" | "published" | "failed";
    tags?: string[];
    hashtags?: string[];
    visibility?: string;
}

export interface LateSchedulePostRequest {
    scheduledFor: string; // ISO 8601 format (e.g., "2023-10-15T14:00:00Z")
    timezone: string; // e.g., "America/Chicago"
    platforms?: string[]; // e.g., ["linkedin"] - optional, defaults to linkedin
}

export interface LateErrorResponse {
    error: string;
    message?: string;
}

/**
 * Get posts from Late.dev
 * @param params - Query parameters for filtering and pagination
 * @returns Posts response with pagination info
 */
export async function getPosts(
    params: LateGetPostsParams = {}
): Promise<LateGetPostsResponse> {
    const apiKey = process.env.LATE_SECRET_KEY;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    // Build query string
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
    const url = `https://getlate.dev/api/v1/posts${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        let errorData: LateErrorResponse;
        try {
            errorData = await response.json();
        } catch {
            const errorText = await response.text();
            throw new Error(
                `Failed to get posts (${response.status}): ${errorText || response.statusText}`
            );
        }

        const errorMessage =
            errorData.message || errorData.error || `Failed to get posts: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

/**
 * Update a post in Late.dev
 * @param postId - The ID of the post to update
 * @param updates - The fields to update
 * @returns The updated post
 */
export async function updatePost(
    postId: string,
    updates: LateUpdatePostRequest
): Promise<LatePost> {
    const apiKey = process.env.LATE_SECRET_KEY;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    const url = `https://getlate.dev/api/v1/posts/${postId}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(updates),
    });

    if (!response.ok) {
        let errorData: LateErrorResponse;
        try {
            errorData = await response.json();
        } catch {
            const errorText = await response.text();
            throw new Error(
                `Failed to update post (${response.status}): ${errorText || response.statusText}`
            );
        }

        const errorMessage =
            errorData.message || errorData.error || `Failed to update post: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

/**
 * Schedule a post in Late.dev
 * Uses PUT to update the post with scheduledFor, timezone, and platforms
 * @param postId - The ID of the post to schedule
 * @param scheduleData - The scheduling information
 * @returns The updated post
 */
export async function schedulePost(
    postId: string,
    scheduleData: LateSchedulePostRequest
): Promise<LatePost> {
    const profileId = process.env.LATE_PROFILE_ID;

    if (!profileId) {
        throw new Error("LATE_PROFILE_ID is not configured");
    }

    // Default to linkedin if no platforms specified
    const platforms = scheduleData.platforms && scheduleData.platforms.length > 0
        ? scheduleData.platforms
        : ["linkedin"];

    // Transform platforms to include accountId
    const platformsWithAccountId = platforms.map(platform => ({
        accountId: profileId,
        platform,
    }));

    const updatePayload = {
        scheduledFor: scheduleData.scheduledFor,
        timezone: scheduleData.timezone,
        platforms: platformsWithAccountId,
        isDraft: false, // Required to actually schedule the post
    };

    // Use updatePost to schedule - Late.dev uses PUT with scheduledFor, timezone, platforms, and isDraft
    return updatePost(postId, updatePayload);
}

/**
 * Delete a post in Late.dev
 * @param postId - The ID of the post to delete
 * @returns void
 */
export async function deletePost(postId: string): Promise<void> {
    const apiKey = process.env.LATE_SECRET_KEY;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    const url = `https://getlate.dev/api/v1/posts/${postId}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        let errorData: LateErrorResponse;
        try {
            errorData = await response.json();
        } catch {
            const errorText = await response.text();
            throw new Error(
                `Failed to delete post (${response.status}): ${errorText || response.statusText}`
            );
        }

        const errorMessage =
            errorData.message || errorData.error || `Failed to delete post: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    // DELETE requests typically return 204 No Content or 200 OK
    // If there's a response body, try to parse it, otherwise just return
    if (response.status !== 204) {
        try {
            await response.json();
        } catch {
            // No body, that's fine
        }
    }
}

