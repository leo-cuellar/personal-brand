import { Inspiration, NewInspiration } from "../supabase/schemas";
import { transformInspiration } from "./utils";

const API_BASE_URL = "/api/inspirations";

export interface GetInspirationsParams {
    includeArchived?: boolean;
    personId?: string | null;
}

export async function getInspirations(
    params?: GetInspirationsParams
): Promise<Inspiration[]> {
    const queryParams = new URLSearchParams();
    if (params?.includeArchived) {
        queryParams.append("includeArchived", "true");
    }
    if (params?.personId) {
        queryParams.append("personId", params.personId);
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
        throw new Error(error.error || "Failed to fetch inspirations");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformInspiration) : [];
}

export async function createInspiration(
    inspiration: NewInspiration
): Promise<Inspiration> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(inspiration),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create inspiration");
    }

    const { data } = await response.json();
    return transformInspiration(data);
}

export async function updateInspiration(
    id: string,
    updates: Partial<Inspiration>
): Promise<Inspiration> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update inspiration");
    }

    const { data } = await response.json();
    return transformInspiration(data);
}

export async function deleteInspiration(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete inspiration");
    }
}

