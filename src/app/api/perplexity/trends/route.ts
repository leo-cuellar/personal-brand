import { NextRequest, NextResponse } from "next/server";
import { searchTrendsByCategory } from "../../../../../services/perplexity/trends";
import { supabaseAdmin } from "../../../../../services/supabase/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { personId } = body;

        if (!personId || typeof personId !== "string") {
            return NextResponse.json(
                { error: "personId is required and must be a string" },
                { status: 400 }
            );
        }

        // Get publication categories for this person that are enabled for search
        const { data: categories, error: categoriesError } = await supabaseAdmin
            .from("publication_categories")
            .select("id, name, description")
            .eq("person_id", personId)
            .eq("is_archived", false)
            .eq("use_for_search", true)
            .order("created_at", { ascending: false });

        if (categoriesError) {
            return NextResponse.json(
                { error: `Failed to fetch categories: ${categoriesError.message}` },
                { status: 500 }
            );
        }

        if (!categories || categories.length === 0) {
            return NextResponse.json({
                results: [],
                message: "No categories enabled for search found",
            });
        }

        // Search trends for each category
        const results = await Promise.allSettled(
            categories.map(async (category) => {
                const trends = await searchTrendsByCategory(
                    category.name,
                    category.description || ""
                );
                return {
                    categoryId: category.id,
                    categoryName: category.name,
                    trends: trends.trends,
                };
            })
        );

        // Process results, handling both fulfilled and rejected promises
        const processedResults = results.map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value;
            } else {
                // Return error information for failed searches
                return {
                    categoryId: categories[index].id,
                    categoryName: categories[index].name,
                    trends: [],
                    error: result.reason instanceof Error ? result.reason.message : "Unknown error",
                };
            }
        });

        return NextResponse.json({
            results: processedResults,
        });
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

