import { NextRequest, NextResponse } from "next/server";
import { updatePost, schedulePost, deletePost, type LateUpdatePostRequest, type LateSchedulePostRequest } from "@/services/late/posts";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body: LateUpdatePostRequest | LateSchedulePostRequest = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }

        // If this is a schedule request (has scheduledFor and timezone, but no title/content)
        // Use schedulePost instead of updatePost
        if (
            "scheduledFor" in body &&
            "timezone" in body &&
            !("title" in body) &&
            !("content" in body)
        ) {
            const scheduledPost = await schedulePost(id, body as LateSchedulePostRequest);
            return NextResponse.json(scheduledPost);
        }

        // Otherwise, use regular updatePost
        const updatedPost = await updatePost(id, body as LateUpdatePostRequest);
        return NextResponse.json(updatedPost);
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update post",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }

        await deletePost(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete post",
            },
            { status: 500 }
        );
    }
}

