import { NextRequest, NextResponse } from "next/server";
import { schedulePost } from "@/services/api-wrapper/late";
import { supabaseAdmin } from "@/services/supabase/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { publicationId, text, schedule } = body;

        // Validate required fields
        if (!publicationId) {
            return NextResponse.json(
                { error: "publicationId is required" },
                { status: 400 }
            );
        }

        // Validate text exists and is not empty after trimming
        const trimmedText = text?.trim();
        if (!trimmedText || trimmedText.length === 0) {
            return NextResponse.json(
                { error: "text is required and cannot be empty" },
                { status: 400 }
            );
        }

        // Schedule post on Late.dev
        // Always uses LinkedIn as the platform
        const lateResponse = await schedulePost({
            text: trimmedText, // Use trimmed text
            schedule: schedule || undefined,
        });

        // Update publication with Late post ID and status
        const { data, error } = await supabaseAdmin
            .from("publications")
            .update({
                late_post_id: lateResponse.id,
                status: "scheduled",
                scheduled_at: schedule ? new Date(schedule).toISOString() : null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", publicationId)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: `Failed to update publication: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            latePost: lateResponse,
            publication: data,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to schedule post",
            },
            { status: 500 }
        );
    }
}

