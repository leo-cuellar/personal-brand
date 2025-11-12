import { PublicationIdea, NewPublicationIdea } from "../supabase/schemas";
import { transformPublicationIdea } from "./utils";

const API_BASE_URL = "/api/publication-ideas";

export interface GetPublicationIdeasParams {
    includeArchived?: boolean;
    personalBrandId?: string | null;
    status?: "in_review" | "accepted" | "rejected" | "used";
}

export async function getPublicationIdeas(
    params?: GetPublicationIdeasParams
): Promise<PublicationIdea[]> {
    const queryParams = new URLSearchParams();
    if (params?.includeArchived) {
        queryParams.append("includeArchived", "true");
    }
    if (params?.personalBrandId) {
        queryParams.append("personalBrandId", params.personalBrandId);
    }
    if (params?.status) {
        queryParams.append("status", params.status);
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
        throw new Error(error.error || "Failed to fetch publication ideas");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPublicationIdea) : [];
}

export async function createPublicationIdea(
    publicationIdea: NewPublicationIdea
): Promise<PublicationIdea> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(publicationIdea),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create publication idea");
    }

    const { data } = await response.json();
    return transformPublicationIdea(data);
}

export async function updatePublicationIdea(
    id: string,
    updates: Partial<PublicationIdea>
): Promise<PublicationIdea> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update publication idea");
    }

    const { data } = await response.json();
    return transformPublicationIdea(data);
}

export async function deletePublicationIdea(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete publication idea");
    }
}

