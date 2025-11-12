import { StrongOpinion, NewStrongOpinion } from "../supabase/schemas";
import { transformStrongOpinion } from "./utils";

const API_BASE_URL = "/api/strong-opinions";

export interface GetStrongOpinionsParams {
    includeArchived?: boolean;
    personId?: string | null;
}

export async function getStrongOpinions(
    params?: GetStrongOpinionsParams
): Promise<StrongOpinion[]> {
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
        throw new Error(error.error || "Failed to fetch strong opinions");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformStrongOpinion) : [];
}

export async function createStrongOpinion(
    strongOpinion: NewStrongOpinion
): Promise<StrongOpinion> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(strongOpinion),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create strong opinion");
    }

    const { data } = await response.json();
    return transformStrongOpinion(data);
}

export async function updateStrongOpinion(
    id: string,
    updates: Partial<StrongOpinion>
): Promise<StrongOpinion> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update strong opinion");
    }

    const { data } = await response.json();
    return transformStrongOpinion(data);
}

export async function deleteStrongOpinion(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete strong opinion");
    }
}

