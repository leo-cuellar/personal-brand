import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/services/supabase/client";
import { StrongOpinion, NewStrongOpinion } from "@/services/supabase/schemas";

// GET - Get all strong opinions
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const personId = searchParams.get("personId");

        let query = supabaseAdmin
            .from("strong_opinions")
            .select("*")
            .order("created_at", { ascending: false });

        if (personId) {
            query = query.eq("person_id", personId);
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
            { error: "Failed to fetch strong opinions" },
            { status: 500 }
        );
    }
}

// POST - Create a new strong opinion
export async function POST(request: NextRequest) {
    try {
        const body: NewStrongOpinion = await request.json();

        const { data, error } = await supabaseAdmin
            .from("strong_opinions")
            .insert({
                person_id: body.personId,
                opinion: body.opinion,
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
            { error: "Failed to create strong opinion" },
            { status: 500 }
        );
    }
}

// PUT - Update a strong opinion
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<StrongOpinion> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            opinion?: string;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.opinion !== undefined) updateData.opinion = body.opinion;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("strong_opinions")
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
            { error: "Failed to update strong opinion" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a strong opinion (permanent delete)
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
            .from("strong_opinions")
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
            { error: "Failed to delete strong opinion" },
            { status: 500 }
        );
    }
}

