import { Publication, NewPublication } from "@/services/supabase/schemas";
import { transformPublication } from "./utils";

const API_BASE_URL = "/api/publications";

export interface GetPublicationsParams {
    includeArchived?: boolean;
    status?: "draft" | "scheduled" | "published";
    personId?: string | null;
}

export async function getPublications(
    params?: GetPublicationsParams
): Promise<Publication[]> {
    const queryParams = new URLSearchParams();
    if (params?.includeArchived) {
        queryParams.append("includeArchived", "true");
    }
    if (params?.status) {
        queryParams.append("status", params.status);
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
        throw new Error(error.error || "Failed to fetch publications");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPublication) : [];
}

export async function createPublication(
    publication: NewPublication
): Promise<Publication> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(publication),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create publication");
    }

    const { data } = await response.json();
    return transformPublication(data);
}

export async function updatePublication(
    id: string,
    updates: Partial<Publication>
): Promise<Publication> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update publication");
    }

    const { data } = await response.json();
    return transformPublication(data);
}

export async function deletePublication(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete publication");
    }
}

