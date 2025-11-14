import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../services/supabase/client";
import { BuyerPersona, NewBuyerPersona } from "../../../../services/supabase/schemas";
import { transformBuyerPersona } from "../../../../services/api-wrapper/utils";

// GET - Get all buyer personas
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";

        let query = supabaseAdmin
            .from("buyer_personas")
            .select("*")
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

        // Transform data to camelCase
        const transformedData = Array.isArray(data)
            ? data.map(transformBuyerPersona)
            : [];

        return NextResponse.json({ data: transformedData });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch buyer personas" },
            { status: 500 }
        );
    }
}

// POST - Create a new buyer persona
export async function POST(request: NextRequest) {
    try {
        const body: NewBuyerPersona = await request.json();

        const { data, error } = await supabaseAdmin
            .from("buyer_personas")
            .insert({
                name: body.name,
                description: body.description || null,
                goals: body.goals || [],
                frustrations: body.frustrations || [],
                desires: body.desires || [],
                knowledge_level: body.knowledgeLevel || "medium",
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

        const transformedData = transformBuyerPersona(data);
        return NextResponse.json({ data: transformedData }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Failed to create buyer persona" },
            { status: 500 }
        );
    }
}

// PUT - Update a buyer persona
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<BuyerPersona> & { id: string } =
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
            goals?: unknown;
            frustrations?: unknown;
            desires?: unknown;
            knowledge_level?: string;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.goals !== undefined) updateData.goals = body.goals;
        if (body.frustrations !== undefined) updateData.frustrations = body.frustrations;
        if (body.desires !== undefined) updateData.desires = body.desires;
        if (body.knowledgeLevel !== undefined) updateData.knowledge_level = body.knowledgeLevel;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("buyer_personas")
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

        const transformedData = transformBuyerPersona(data);
        return NextResponse.json({ data: transformedData });
    } catch {
        return NextResponse.json(
            { error: "Failed to update buyer persona" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a buyer persona (permanent delete)
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
            .from("buyer_personas")
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
            { error: "Failed to delete buyer persona" },
            { status: 500 }
        );
    }
}

