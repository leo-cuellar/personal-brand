import { NextRequest, NextResponse } from "next/server";
import { searchTrends } from "../../../../../services/perplexity/search";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, maxResults } = body;

        if (!query || typeof query !== "string") {
            return NextResponse.json(
                { error: "Query is required and must be a string" },
                { status: 400 }
            );
        }

        const maxResultsNumber = maxResults && typeof maxResults === "number"
            ? Math.min(Math.max(1, maxResults), 50) // Clamp between 1 and 50
            : 10;

        const result = await searchTrends(query, maxResultsNumber);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to search trends",
            },
            { status: 500 }
        );
    }
}

