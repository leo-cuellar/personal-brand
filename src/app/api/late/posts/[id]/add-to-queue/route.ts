import { NextResponse } from "next/server";
import { getNextSlot } from "../../../../../../../services/late/queue";
import { schedulePost, type LateSchedulePostRequest } from "../../../../../../../services/late/posts";

// POST - Add post to queue (gets next slot and schedules automatically)
export async function POST(
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

        if (!id) {
            console.error("[API /late/posts/[id]/add-to-queue] POST Error: Post ID is required");
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }

        // Step 1: Get next available slot
        const nextSlot = await getNextSlot();

        // Step 2: Schedule the post with the next slot
        const scheduleData: LateSchedulePostRequest = {
            scheduledFor: nextSlot.nextSlot,
            timezone: nextSlot.timezone,
            // platforms not needed - post already has platforms from draft
        };

        const scheduledPost = await schedulePost(id, scheduleData);

        return NextResponse.json(scheduledPost, { status: 200 });
    } catch (error) {
        console.error("[API /late/posts/[id]/add-to-queue] POST Error:", error);
        console.error("[API /late/posts/[id]/add-to-queue] POST Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
        });

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to add post to queue",
            },
            { status: 500 }
        );
    }
}

