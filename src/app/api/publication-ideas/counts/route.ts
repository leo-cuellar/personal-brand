import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../services/supabase/client";

// GET - Get counts of publication ideas by status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const personalBrandId = searchParams.get("personalBrandId");

        if (!personalBrandId) {
            return NextResponse.json(
                { error: "personalBrandId is required" },
                { status: 400 }
            );
        }

        // Get counts for in_review and accepted statuses (excluding archived)
        const [inReviewResult, acceptedResult] = await Promise.all([
            supabaseAdmin
                .from("publication_ideas")
                .select("id", { count: "exact", head: true })
                .eq("personal_brand_id", personalBrandId)
                .eq("status", "in_review")
                .eq("is_archived", false),
            supabaseAdmin
                .from("publication_ideas")
                .select("id", { count: "exact", head: true })
                .eq("personal_brand_id", personalBrandId)
                .eq("status", "accepted")
                .eq("is_archived", false),
        ]);

        if (inReviewResult.error || acceptedResult.error) {
            return NextResponse.json(
                { error: inReviewResult.error?.message || acceptedResult.error?.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            data: {
                in_review: inReviewResult.count || 0,
                accepted: acceptedResult.count || 0,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch publication idea counts" },
            { status: 500 }
        );
    }
}

