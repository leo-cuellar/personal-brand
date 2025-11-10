import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/services/supabase/client";
import { Publication, NewPublication } from "@/services/supabase/schemas";

// GET - Get all publications
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const status = searchParams.get("status");
        const personId = searchParams.get("personId");

        let query = supabaseAdmin
            .from("publications")
            .select("*")
            .order("created_at", { ascending: false });

        if (personId) {
            query = query.eq("person_id", personId);
        }

        if (!includeArchived) {
            query = query.eq("is_archived", false);
        }

        if (status) {
            query = query.eq("status", status);
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
            { error: "Failed to fetch publications" },
            { status: 500 }
        );
    }
}

// POST - Create a new publication
export async function POST(request: NextRequest) {
    try {
        const body: NewPublication = await request.json();

        const { data, error } = await supabaseAdmin
            .from("publications")
            .insert({
                person_id: body.personId,
                title: body.title || null,
                content: body.content,
                status: body.status || "draft",
                platform: body.platform || "linkedin",
                scheduled_at: body.scheduledAt
                    ? new Date(body.scheduledAt).toISOString()
                    : null,
                published_at: body.publishedAt
                    ? new Date(body.publishedAt).toISOString()
                    : null,
                source: body.source || null,
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
            { error: "Failed to create publication" },
            { status: 500 }
        );
    }
}

// PUT - Update a publication
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<Publication> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            title?: string | null;
            content?: string;
            status?: string;
            platform?: string;
            scheduled_at?: string | null;
            published_at?: string | null;
            source?: string | null;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.title !== undefined) updateData.title = body.title || null;
        if (body.content !== undefined) updateData.content = body.content;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.platform !== undefined) updateData.platform = body.platform;
        if (body.scheduledAt !== undefined)
            updateData.scheduled_at = body.scheduledAt
                ? new Date(body.scheduledAt).toISOString()
                : null;
        if (body.publishedAt !== undefined)
            updateData.published_at = body.publishedAt
                ? new Date(body.publishedAt).toISOString()
                : null;
        if (body.source !== undefined) updateData.source = body.source || null;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("publications")
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
            { error: "Failed to update publication" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a publication (permanent delete)
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
            .from("publications")
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
            { error: "Failed to delete publication" },
            { status: 500 }
        );
    }
}

