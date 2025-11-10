import { NextResponse } from "next/server";

export async function GET() {
    try {
        const trendScannerUrl = process.env.TREND_SCANNER_URL;

        if (!trendScannerUrl) {
            return NextResponse.json(
                { error: "TREND_SCANNER_URL is not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(trendScannerUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Failed to fetch from trend scanner: ${errorText}` },
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
                        : "Failed to call trend scanner",
            },
            { status: 500 }
        );
    }
}

