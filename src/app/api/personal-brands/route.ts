import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../services/supabase/client";
import { PersonalBrand, NewPersonalBrand } from "../../../../services/supabase/schemas";

// GET - Get all personal brands
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const includeProfile = searchParams.get("includeProfile") !== "false"; // Default to true for backward compatibility

        // Select fields based on whether profile (brand_narrative + strong_opinions) is needed
        const selectFields = includeProfile
            ? "*"
            : "id, name, username, social_accounts, created_at, updated_at, is_archived";

        let query = supabaseAdmin
            .from("personal_brands")
            .select(selectFields)
            .order("created_at", { ascending: false });

        if (!includeArchived) {
            query = query.eq("is_archived", false);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch personal brands" },
            { status: 500 }
        );
    }
}

// POST - Create a new personal brand
export async function POST(request: NextRequest) {
    try {
        const body: NewPersonalBrand = await request.json();

        // Build default brand_narrative object if not provided
        const defaultBrandNarrative = {
            immediateCredibility: "",
            professionalProblemOrChallenge: "",
            internalStruggles: "",
            externalContext: "",
            keyMicrotransitions: "",
            insightOrSpark: "",
            process: "",
            resultOrTransformation: "",
            sharedBeliefs: "",
            currentVisionOrPersonalMission: "",
            socialProofOrValidation: "",
            callToAction: "",
        };

        const { data, error } = await supabaseAdmin
            .from("personal_brands")
            .insert({
                name: body.name,
                username: body.username,
                social_accounts: body.socialAccounts || {},
                brand_narrative: body.brandNarrative || defaultBrandNarrative,
                strong_opinions: body.strongOpinions || [],
                is_archived: body.isArchived || false,
            })
            .select("id, name, username, social_accounts, created_at, updated_at, is_archived")
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Failed to create person" },
            { status: 500 }
        );
    }
}

// PUT - Update a personal brand
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<PersonalBrand> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            name?: string;
            username?: string;
            social_accounts?: unknown;
            brand_narrative?: unknown;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.username !== undefined) updateData.username = body.username;
        if (body.socialAccounts !== undefined) {
            updateData.social_accounts = body.socialAccounts;
        }
        if (body.brandNarrative !== undefined)
            updateData.brand_narrative = body.brandNarrative;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("personal_brands")
            .update(updateData)
            .eq("id", body.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Failed to update person" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a personal brand (permanent delete)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("personal_brands")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete person" },
            { status: 500 }
        );
    }
}

