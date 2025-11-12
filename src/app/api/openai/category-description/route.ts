import { NextRequest, NextResponse } from "next/server";
import { generateCategoryDescription } from "../../../../../services/openai/category-description";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { categoryName, personId } = body;

        if (!categoryName || typeof categoryName !== "string") {
            return NextResponse.json(
                { error: "categoryName is required and must be a string" },
                { status: 400 }
            );
        }

        if (!personId || typeof personId !== "string") {
            return NextResponse.json(
                { error: "personId is required and must be a string" },
                { status: 400 }
            );
        }

        const description = await generateCategoryDescription({
            categoryName,
            personId,
        });

        return NextResponse.json({ description });
    } catch (error) {
        console.error("Error generating category description:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to generate category description",
            },
            { status: 500 }
        );
    }
}

