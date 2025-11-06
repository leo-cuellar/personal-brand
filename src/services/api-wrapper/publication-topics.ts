import { PublicationTopic, NewPublicationTopic } from "@/services/supabase/schemas";
import { transformPublicationTopic } from "./utils";

const API_BASE_URL = "/api/publication-topics";

export interface GetPublicationTopicsParams {
    includeArchived?: boolean;
}

export async function getPublicationTopics(
    params?: GetPublicationTopicsParams
): Promise<PublicationTopic[]> {
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
        throw new Error(error.error || "Failed to fetch publication topics");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPublicationTopic) : [];
}

export async function createPublicationTopic(
    publicationTopic: NewPublicationTopic
): Promise<PublicationTopic> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(publicationTopic),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create publication topic");
    }

    const { data } = await response.json();
    return transformPublicationTopic(data);
}

export async function updatePublicationTopic(
    id: string,
    updates: Partial<PublicationTopic>
): Promise<PublicationTopic> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update publication topic");
    }

    const { data } = await response.json();
    return transformPublicationTopic(data);
}

export async function deletePublicationTopic(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete publication topic");
    }
}

