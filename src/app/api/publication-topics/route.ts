import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/services/supabase/client";
import { PublicationTopic, NewPublicationTopic } from "@/services/supabase/schemas";

// GET - Get all publication topics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const personId = searchParams.get("personId");

        let query = supabaseAdmin
            .from("publication_topics")
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
            { error: "Failed to fetch publication topics" },
            { status: 500 }
        );
    }
}

// POST - Create a new publication topic
export async function POST(request: NextRequest) {
    try {
        const body: NewPublicationTopic = await request.json();

        const { data, error } = await supabaseAdmin
            .from("publication_topics")
            .insert({
                person_id: body.personId,
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
            { error: "Failed to create publication topic" },
            { status: 500 }
        );
    }
}

// PUT - Update a publication topic
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<PublicationTopic> & { id: string } =
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
            .from("publication_topics")
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
            { error: "Failed to update publication topic" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a publication topic (permanent delete)
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
            .from("publication_topics")
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
            { error: "Failed to delete publication topic" },
            { status: 500 }
        );
    }
}

