const API_BASE_URL = "/api/n8n";

export interface TrendScannerResponse {
    data: unknown;
}

export async function trendScanner(): Promise<TrendScannerResponse> {
    const response = await fetch(`${API_BASE_URL}/trend-scanner`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to call trend scanner");
    }

    const data: TrendScannerResponse = await response.json();
    return data;
}

