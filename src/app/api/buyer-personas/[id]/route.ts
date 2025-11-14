import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../services/supabase/client";
import { transformBuyerPersona } from "../../../../../services/api-wrapper/utils";

// GET - Get a single buyer persona by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("buyer_personas")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Buyer persona not found" },
                { status: 404 }
            );
        }

        const transformed = transformBuyerPersona(data);
        return NextResponse.json({ data: transformed });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch buyer persona" },
            { status: 500 }
        );
    }
}

