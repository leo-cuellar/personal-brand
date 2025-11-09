import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/services/supabase/client";
import { Inspiration, NewInspiration } from "@/services/supabase/schemas";

// GET - Get all inspirations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const personId = searchParams.get("personId");

        let query = supabaseAdmin
            .from("inspirations")
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
            { error: "Failed to fetch inspirations" },
            { status: 500 }
        );
    }
}

// POST - Create a new inspiration
export async function POST(request: NextRequest) {
    try {
        const body: NewInspiration = await request.json();

        const { data, error } = await supabaseAdmin
            .from("inspirations")
            .insert({
                person_id: body.personId,
                text: body.text,
                link: body.link || null,
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
            { error: "Failed to create inspiration" },
            { status: 500 }
        );
    }
}

// PUT - Update an inspiration
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<Inspiration> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            text?: string;
            link?: string | null;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.text !== undefined) updateData.text = body.text;
        if (body.link !== undefined) updateData.link = body.link || null;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("inspirations")
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
            { error: "Failed to update inspiration" },
            { status: 500 }
        );
    }
}

// DELETE - Delete an inspiration (permanent delete)
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
            .from("inspirations")
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
            { error: "Failed to delete inspiration" },
            { status: 500 }
        );
    }
}

