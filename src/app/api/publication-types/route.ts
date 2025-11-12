import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../services/supabase/client";
import { PublicationType, NewPublicationType } from "../../../../services/supabase/schemas";

// GET - Get all publication types
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const personalBrandId = searchParams.get("personalBrandId");

        let query = supabaseAdmin
            .from("publication_types")
            .select("*")
            .order("created_at", { ascending: false });

        if (personalBrandId) {
            query = query.eq("personal_brand_id", personalBrandId);
        }

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
            { error: "Failed to fetch publication types" },
            { status: 500 }
        );
    }
}

// POST - Create a new publication type
export async function POST(request: NextRequest) {
    try {
        const body: NewPublicationType = await request.json();

        const { data, error } = await supabaseAdmin
            .from("publication_types")
            .insert({
                personal_brand_id: body.personalBrandId,
                name: body.name,
                description: body.description,
                is_archived: body.isArchived || false,
            })
            .select()
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
            { error: "Failed to create publication type" },
            { status: 500 }
        );
    }
}

// PUT - Update a publication type
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<PublicationType> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            name?: string;
            description?: string;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined)
            updateData.description = body.description;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("publication_types")
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
            { error: "Failed to update publication type" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a publication type (permanent delete)
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
            .from("publication_types")
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
            { error: "Failed to delete publication type" },
            { status: 500 }
        );
    }
}

