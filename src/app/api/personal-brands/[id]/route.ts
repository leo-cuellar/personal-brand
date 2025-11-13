import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../services/supabase/client";
import { transformPersonalBrand } from "../../../../../services/api-wrapper/utils";

// GET - Get a single personal brand by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json(
                { error: "Personal brand ID is required" },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const fields = searchParams.get("fields"); // Can be "basic", "narrative", "opinions", "all" (default)

        // Select fields based on what's requested
        let selectFields: string;
        if (fields === "basic") {
            selectFields = "id, name, username, social_accounts, created_at, updated_at, is_archived";
        } else if (fields === "narrative") {
            selectFields = "id, name, username, social_accounts, brand_narrative, created_at, updated_at, is_archived";
        } else if (fields === "opinions") {
            selectFields = "id, name, username, social_accounts, strong_opinions, created_at, updated_at, is_archived";
        } else {
            // Default: all fields
            selectFields = "*";
        }

        const { data, error } = await supabaseAdmin
            .from("personal_brands")
            .select(selectFields)
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Personal brand not found" },
                { status: 404 }
            );
        }

        // Type assertion needed because Supabase returns data with dynamic fields based on select
        const typedData = data as unknown as {
            id: string;
            name: string;
            username: string;
            social_accounts?: unknown;
            brand_narrative?: unknown;
            strong_opinions?: string[] | null;
            created_at: string;
            updated_at: string;
            is_archived: boolean;
        };
        const transformed = transformPersonalBrand(typedData as unknown as Parameters<typeof transformPersonalBrand>[0]);
        return NextResponse.json({ data: transformed });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch personal brand" },
            { status: 500 }
        );
    }
}

// PATCH - Update specific fields of a personal brand
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json(
                { error: "Personal brand ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const updateData: {
            brand_narrative?: unknown;
            strong_opinions?: string[];
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.brandNarrative !== undefined) {
            updateData.brand_narrative = body.brandNarrative;
        }

        if (body.strongOpinions !== undefined) {
            updateData.strong_opinions = body.strongOpinions;
        }

        // Determine which fields to return based on what was updated
        let selectFields = "id, name, username, social_accounts, created_at, updated_at, is_archived";
        if (body.brandNarrative !== undefined) {
            selectFields += ", brand_narrative";
        }
        if (body.strongOpinions !== undefined) {
            selectFields += ", strong_opinions";
        }

        const { data, error } = await supabaseAdmin
            .from("personal_brands")
            .update(updateData)
            .eq("id", id)
            .select(selectFields)
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Personal brand not found" },
                { status: 404 }
            );
        }

        // Return only the updated fields
        const result: { brandNarrative?: unknown; strongOpinions?: string[] } = {};
        const typedData = data as {
            brand_narrative?: unknown;
            strong_opinions?: string[] | null;
        };

        if (body.brandNarrative !== undefined && typedData.brand_narrative !== undefined) {
            result.brandNarrative = typedData.brand_narrative;
        }
        if (body.strongOpinions !== undefined && typedData.strong_opinions !== undefined) {
            result.strongOpinions = Array.isArray(typedData.strong_opinions)
                ? typedData.strong_opinions
                : [];
        }

        return NextResponse.json({ data: result });
    } catch {
        return NextResponse.json(
            { error: "Failed to update personal brand" },
            { status: 500 }
        );
    }
}

