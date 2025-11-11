import { NextRequest, NextResponse } from "next/server";
import { updatePost, type LateUpdatePostRequest } from "@/services/late/posts";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const { id } = resolvedParams;
        const body: LateUpdatePostRequest = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }

        const updatedPost = await updatePost(id, body);

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

