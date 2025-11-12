import { NextRequest, NextResponse } from "next/server";
import { getPosts, type LateGetPostsParams } from "../../../../../services/late/posts";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

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

        const platform = searchParams.get("platform");
        if (platform) {
            params.platform = platform;
        }

        const profileId = searchParams.get("profileId");
        if (profileId) {
            params.profileId = profileId;
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

        const response = await getPosts(params);

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get posts",
            },
            { status: 500 }
        );
    }
}

