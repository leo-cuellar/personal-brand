import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../services/supabase/client";
import { PublicationStructure, NewPublicationStructure } from "../../../../services/supabase/schemas";

// GET - Get all publication structures
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const personalBrandId = searchParams.get("personalBrandId");

        let query = supabaseAdmin
            .from("publication_structures")
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
            { error: "Failed to fetch publication structures" },
            { status: 500 }
        );
    }
}

// POST - Create a new publication structure
export async function POST(request: NextRequest) {
    try {
        const body: NewPublicationStructure = await request.json();

        const { data, error } = await supabaseAdmin
            .from("publication_structures")
            .insert({
                personal_brand_id: body.personalBrandId,
                name: body.name,
                description: body.description || null,
                structure: body.structure,
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
            { error: "Failed to create publication structure" },
            { status: 500 }
        );
    }
}

// PUT - Update a publication structure
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<PublicationStructure> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            name?: string;
            description?: string | null;
            structure?: unknown;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined)
            updateData.description = body.description || null;
        if (body.structure !== undefined) updateData.structure = body.structure;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("publication_structures")
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
            { error: "Failed to update publication structure" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a publication structure (permanent delete)
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
            .from("publication_structures")
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
            { error: "Failed to delete publication structure" },
            { status: 500 }
        );
    }
}

