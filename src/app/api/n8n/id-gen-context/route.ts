import { NextResponse } from "next/server";

export async function GET() {
    try {
        const idGenContextUrl = process.env.ID_GEN_CONTEXT_URL;

        if (!idGenContextUrl) {
            return NextResponse.json(
                { error: "ID_GEN_CONTEXT_URL is not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(idGenContextUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch from id gen context: ${errorText}` },
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
                        : "Failed to call id gen context",
            },
            { status: 500 }
        );
    }
}

