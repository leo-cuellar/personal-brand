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

