import { NextResponse } from "next/server";
import { getNextSlot } from "../../../../../../services/late/queue";

// GET - Get next available slot from queue
export async function GET() {
    try {
        // Always use profileId from environment variables, ignore query params
        const profileId = process.env.LATE_PROFILE_ID;

        if (!profileId) {
            return NextResponse.json(
                { error: "LATE_PROFILE_ID is not configured in environment variables." },
                { status: 400 }
            );
        }

        console.log("[API /late/queue/next-slot] GET - Using profileId from LATE_PROFILE_ID env var:", profileId);
        const response = await getNextSlot();
        console.log("[API /late/queue/next-slot] GET Success");

        return NextResponse.json(response);
    } catch (error) {
        console.error("[API /late/queue/next-slot] GET Error:", error);
        console.error("[API /late/queue/next-slot] GET Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get next slot",
            },
            { status: 500 }
        );
    }
}

