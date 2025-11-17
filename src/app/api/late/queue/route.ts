import { NextRequest, NextResponse } from "next/server";
import { updateQueueSlots, getQueueSlots, deleteQueueSlots, type UpdateQueueSlotsRequest } from "../../../../../services/late/queue";

// PUT - Update queue slots
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        console.log("[API /late/queue] Request body:", JSON.stringify(body, null, 2));

        // Get profileId from environment if not provided
        const profileId = body.profileId || process.env.LATE_PROFILE_ID;
        if (!profileId) {
            return NextResponse.json(
                { error: "profileId is required. Provide it in the request body or set LATE_PROFILE_ID in environment variables." },
                { status: 400 }
            );
        }

        const requestData: UpdateQueueSlotsRequest = {
            profileId,
            timezone: body.timezone || "America/New_York",
            slots: body.slots || [],
            active: body.active !== undefined ? body.active : true,
            reshuffleExisting: body.reshuffleExisting !== undefined ? body.reshuffleExisting : false,
        };

        console.log("[API /late/queue] Calling updateQueueSlots with data:", JSON.stringify(requestData, null, 2));
        const response = await updateQueueSlots(requestData);
        console.log("[API /late/queue] Success");

        return NextResponse.json(response);
    } catch (error) {
        console.error("[API /late/queue] Error:", error);
        console.error("[API /late/queue] Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update queue slots",
            },
            { status: 500 }
        );
    }
}

// GET - Get queue slots configuration (not next-slot, that's in a separate route)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const profileId = searchParams.get("profileId") || process.env.LATE_PROFILE_ID;

        if (!profileId) {
            return NextResponse.json(
                { error: "profileId is required. Provide it in query params or set LATE_PROFILE_ID in environment variables." },
                { status: 400 }
            );
        }

        console.log("[API /late/queue] GET - profileId:", profileId);
        const response = await getQueueSlots(profileId);
        console.log("[API /late/queue] GET Success");

        return NextResponse.json(response);
    } catch (error) {
        console.error("[API /late/queue] GET Error:", error);
        console.error("[API /late/queue] GET Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get queue slots",
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete queue slots configuration
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const profileId = searchParams.get("profileId") || process.env.LATE_PROFILE_ID;

        if (!profileId) {
            return NextResponse.json(
                { error: "profileId is required. Provide it in query params or set LATE_PROFILE_ID in environment variables." },
                { status: 400 }
            );
        }

        console.log("[API /late/queue] DELETE - profileId:", profileId);
        const response = await deleteQueueSlots(profileId);
        console.log("[API /late/queue] DELETE Success");

        return NextResponse.json(response);
    } catch (error) {
        console.error("[API /late/queue] DELETE Error:", error);
        console.error("[API /late/queue] DELETE Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete queue slots",
            },
            { status: 500 }
        );
    }
}

