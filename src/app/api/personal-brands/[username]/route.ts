import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../services/supabase/client";
import { transformPersonalBrand } from "../../../../../services/api-wrapper/utils";

// GET - Get a single personal brand by username
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> | { username: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        let { username } = resolvedParams;

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        // Decode username in case it was URL encoded
        username = decodeURIComponent(username);

        const { searchParams } = new URL(request.url);
        const fields = searchParams.get("fields"); // Can be "basic", "narrative", "opinions", "all" (default)

        // Select fields based on what's requested
        let selectFields: string;
        if (fields === "basic") {
            selectFields = "id, name, username, niche, social_accounts, created_at, updated_at, is_archived";
        } else if (fields === "narrative") {
            selectFields = "id, name, username, niche, social_accounts, brand_narrative, created_at, updated_at, is_archived";
        } else if (fields === "opinions") {
            selectFields = "id, name, username, niche, social_accounts, strong_opinions, created_at, updated_at, is_archived";
        } else {
            // Default: all fields
            selectFields = "*";
        }

        const { data, error } = await supabaseAdmin
            .from("personal_brands")
            .select(selectFields)
            .eq("username", username)
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
            values?: string[] | null;
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
    { params }: { params: Promise<{ username: string }> | { username: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        let { username } = resolvedParams;

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        // Decode username in case it was URL encoded
        username = decodeURIComponent(username);

        const body = await request.json();
        const updateData: {
            niche?: string | null;
            brand_narrative?: unknown;
            strong_opinions?: string[];
            values?: string[];
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.niche !== undefined) {
            updateData.niche = body.niche;
        }

        if (body.brandNarrative !== undefined) {
            updateData.brand_narrative = body.brandNarrative;
        }

        if (body.strongOpinions !== undefined) {
            updateData.strong_opinions = body.strongOpinions;
        }

        if (body.values !== undefined) {
            updateData.values = body.values;
        }

        // Determine which fields to return based on what was updated
        let selectFields = "id, name, username, niche, social_accounts, created_at, updated_at, is_archived";
        if (body.niche !== undefined) {
            selectFields += ", niche";
        }
        if (body.brandNarrative !== undefined) {
            selectFields += ", brand_narrative";
        }
        if (body.strongOpinions !== undefined) {
            selectFields += ", strong_opinions";
        }
        if (body.values !== undefined) {
            selectFields += ", values";
        }

        const { data, error } = await supabaseAdmin
            .from("personal_brands")
            .update(updateData)
            .eq("username", username)
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
        const result: { niche?: string | null; brandNarrative?: unknown; strongOpinions?: string[]; values?: string[] } = {};
        const typedData = data as {
            niche?: string | null;
            brand_narrative?: unknown;
            strong_opinions?: string[] | null;
            values?: string[] | null;
        };

        if (body.niche !== undefined && typedData.niche !== undefined) {
            result.niche = typedData.niche;
        }
        if (body.brandNarrative !== undefined && typedData.brand_narrative !== undefined) {
            result.brandNarrative = typedData.brand_narrative;
        }
        if (body.strongOpinions !== undefined && typedData.strong_opinions !== undefined) {
            result.strongOpinions = Array.isArray(typedData.strong_opinions)
                ? typedData.strong_opinions
                : [];
        }
        if (body.values !== undefined && typedData.values !== undefined) {
            result.values = Array.isArray(typedData.values)
                ? typedData.values
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

