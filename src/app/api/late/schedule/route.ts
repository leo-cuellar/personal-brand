import { NextRequest, NextResponse } from "next/server";
import { schedulePost } from "@/services/api-wrapper/late";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, schedule } = body;

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

        return NextResponse.json({
            success: true,
            latePost: lateResponse,
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

