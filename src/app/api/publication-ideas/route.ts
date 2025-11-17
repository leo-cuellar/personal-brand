import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../services/supabase/client";
import { PublicationIdea, NewPublicationIdea } from "../../../../services/supabase/schemas";

// GET - Get all publication ideas
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const personalBrandId = searchParams.get("personalBrandId");
        const status = searchParams.get("status"); // Filter by status: in_review, accepted, rejected

        let query = supabaseAdmin
            .from("publication_ideas")
            .select("*")
            .order("created_at", { ascending: false });

        if (personalBrandId) {
            query = query.eq("personal_brand_id", personalBrandId);
        }

        if (status && ["in_review", "accepted", "rejected", "used", "incomplete"].includes(status)) {
            query = query.eq("status", status);
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
            { error: "Failed to fetch publication ideas" },
            { status: 500 }
        );
    }
}

// POST - Create a new publication idea (used by n8n)
export async function POST(request: NextRequest) {
    try {
        const body: NewPublicationIdea = await request.json();

        const { data, error } = await supabaseAdmin
            .from("publication_ideas")
            .insert({
                personal_brand_id: body.personalBrandId,
                idea: body.idea,
                description: body.description || null,
                link: body.link || null,
                status: body.status || "in_review",
                source: body.source || null,
                source_summary: body.sourceSummary || null,
                metadata: body.metadata || null,
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
            { error: "Failed to create publication idea" },
            { status: 500 }
        );
    }
}

// PUT - Update a publication idea
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<PublicationIdea> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            idea?: string;
            description?: string | null;
            link?: string | null;
            status?: string;
            source?: string | null;
            source_summary?: string | null;
            metadata?: Record<string, unknown> | null;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.idea !== undefined) updateData.idea = body.idea;
        if (body.description !== undefined)
            updateData.description = body.description || null;
        if (body.link !== undefined) updateData.link = body.link || null;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.source !== undefined) updateData.source = body.source || null;
        if (body.sourceSummary !== undefined)
            updateData.source_summary = body.sourceSummary || null;
        if (body.metadata !== undefined) {
            updateData.metadata = (body.metadata as Record<string, unknown>) || null;
        }
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("publication_ideas")
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
            { error: "Failed to update publication idea" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a publication idea (permanent delete)
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
            .from("publication_ideas")
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
            { error: "Failed to delete publication idea" },
            { status: 500 }
        );
    }
}

