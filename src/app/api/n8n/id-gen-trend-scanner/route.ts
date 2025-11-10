import { NextResponse } from "next/server";

export async function GET() {
    try {
        const idGenTrendScannerUrl = process.env.ID_GEN_TREND_SCANNER_URL;

        if (!idGenTrendScannerUrl) {
            return NextResponse.json(
                { error: "ID_GEN_TREND_SCANNER_URL is not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(idGenTrendScannerUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch from id gen trend scanner: ${errorText}` },
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
                        : "Failed to call id gen trend scanner",
            },
            { status: 500 }
        );
    }
}

