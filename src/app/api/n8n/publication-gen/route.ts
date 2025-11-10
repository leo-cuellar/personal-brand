import { NextResponse } from "next/server";

export async function GET() {
    try {
        const publicationGenUrl = process.env.PUBLICATION_GEN;

        if (!publicationGenUrl) {
            return NextResponse.json(
                { error: "PUBLICATION_GEN is not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(publicationGenUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch from publication gen: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to call publication gen",
            },
            { status: 500 }
        );
    }
}

