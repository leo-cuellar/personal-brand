import { PublicationStructure, NewPublicationStructure } from "../supabase/schemas";
import { transformPublicationStructure } from "./utils";

const API_BASE_URL = "/api/publication-structures";

export interface GetPublicationStructuresParams {
    includeArchived?: boolean;
    personId?: string | null;
}

export async function getPublicationStructures(
    params?: GetPublicationStructuresParams
): Promise<PublicationStructure[]> {
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
        throw new Error(error.error || "Failed to fetch publication structures");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPublicationStructure) : [];
}

export async function createPublicationStructure(
    structure: NewPublicationStructure
): Promise<PublicationStructure> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(structure),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create publication structure");
    }

    const { data } = await response.json();
    return transformPublicationStructure(data);
}

export async function updatePublicationStructure(
    id: string,
    updates: Partial<PublicationStructure>
): Promise<PublicationStructure> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update publication structure");
    }

    const { data } = await response.json();
    return transformPublicationStructure(data);
}

export async function deletePublicationStructure(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete publication structure");
    }
}

