import { BuyerPersona, NewBuyerPersona } from "../supabase/schemas";
import { transformBuyerPersona } from "./utils";

const API_BASE_URL = "/api/buyer-personas";

export interface GetBuyerPersonasParams {
    includeArchived?: boolean;
}

export async function getBuyerPersonas(
    params?: GetBuyerPersonasParams
): Promise<BuyerPersona[]> {
    const queryParams = new URLSearchParams();
    if (params?.includeArchived) {
        queryParams.append("includeArchived", "true");
    }

    const url = `${API_BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch buyer personas");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformBuyerPersona) : [];
}

export async function getBuyerPersonaById(id: string): Promise<BuyerPersona> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch buyer persona");
    }

    const { data } = await response.json();
    return transformBuyerPersona(data);
}

export async function createBuyerPersona(
    buyerPersona: NewBuyerPersona
): Promise<BuyerPersona> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(buyerPersona),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create buyer persona");
    }

    const { data } = await response.json();
    return transformBuyerPersona(data);
}

export async function updateBuyerPersona(
    id: string,
    updates: Partial<BuyerPersona>
): Promise<BuyerPersona> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update buyer persona");
    }

    const { data } = await response.json();
    return transformBuyerPersona(data);
}

export async function deleteBuyerPersona(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete buyer persona");
    }
}

