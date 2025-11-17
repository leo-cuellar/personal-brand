import { NextRequest, NextResponse } from "next/server";
import { improveText } from "../../../../../services/openai/improve-text";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { currentText, userInstruction } = body;

        if (!currentText || typeof currentText !== "string") {
            return NextResponse.json(
                { error: "currentText is required and must be a string" },
                { status: 400 }
            );
        }

        if (!userInstruction || typeof userInstruction !== "string") {
            return NextResponse.json(
                { error: "userInstruction is required and must be a string" },
                { status: 400 }
            );
        }

        const improvedText = await improveText({
            currentText,
            userInstruction,
        });

        return NextResponse.json({ improvedText });
    } catch (error) {
        console.error("Error improving text:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to improve text",
            },
            { status: 500 }
        );
    }
}

