const API_BASE_URL = "/api/n8n";

export interface N8nResponse {
    data: unknown;
}

export async function idGenTrendScanner(): Promise<N8nResponse> {
    const response = await fetch(`${API_BASE_URL}/id-gen-trend-scanner`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to call id gen trend scanner");
    }

    const data: N8nResponse = await response.json();
    return data;
}

export async function idGenContext(): Promise<N8nResponse> {
    const response = await fetch(`${API_BASE_URL}/id-gen-context`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to call id gen context");
    }

    const data: N8nResponse = await response.json();
    return data;
}

export async function publicationGen(): Promise<N8nResponse> {
    const response = await fetch(`${API_BASE_URL}/publication-gen`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to call publication gen");
    }

    const data: N8nResponse = await response.json();
    return data;
}

