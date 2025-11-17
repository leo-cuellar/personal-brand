import { NextRequest, NextResponse } from "next/server";
import { getPosts, type LateGetPostsParams } from "../../../../../services/late/posts";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        console.log("[API /late/posts] Request URL:", request.url);
        console.log("[API /late/posts] Query params:", Object.fromEntries(searchParams.entries()));

        // Build params object from query string
        const params: LateGetPostsParams = {};

        const page = searchParams.get("page");
        if (page) {
            params.page = parseInt(page, 10);
        }

        const limit = searchParams.get("limit");
        if (limit) {
            params.limit = parseInt(limit, 10);
        }

        const status = searchParams.get("status");
        if (status) {
            params.status = status as "draft" | "scheduled" | "published" | "failed";
        }

        // Always filter by LinkedIn by default if platform is not specified
        const platform = searchParams.get("platform");
        if (platform) {
            params.platform = platform;
        } else {
            params.platform = "linkedin";
        }

        // Always use profile ID from environment variables
        const profileId = process.env.LATE_PROFILE_ID;
        if (profileId) {
            params.profileId = profileId;
            console.log("[API /late/posts] Using profileId from LATE_PROFILE_ID env var:", profileId);
        } else {
            console.warn("[API /late/posts] LATE_PROFILE_ID not configured in environment variables");
        }

        const createdBy = searchParams.get("createdBy");
        if (createdBy) {
            params.createdBy = createdBy;
        }

        const dateFrom = searchParams.get("dateFrom");
        if (dateFrom) {
            params.dateFrom = dateFrom;
        }

        const dateTo = searchParams.get("dateTo");
        if (dateTo) {
            params.dateTo = dateTo;
        }

        const includeHidden = searchParams.get("includeHidden");
        if (includeHidden) {
            params.includeHidden = includeHidden === "true";
        }

        console.log("[API /late/posts] Calling getPosts with params:", JSON.stringify(params, null, 2));
        const response = await getPosts(params);
        console.log("[API /late/posts] Success - posts count:", response.posts?.length || 0);

        return NextResponse.json(response);
    } catch (error) {
        console.error("[API /late/posts] Error:", error);
        console.error("[API /late/posts] Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });

        // Return appropriate status code based on error
        const statusCode = error instanceof Error && error.message.includes("Forbidden") ? 403 : 500;

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get posts",
            },
            { status: statusCode }
        );
    }
}

