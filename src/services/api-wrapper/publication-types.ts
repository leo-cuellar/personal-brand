import { PublicationType, NewPublicationType } from "@/services/supabase/schemas";
import { transformPublicationType } from "./utils";

const API_BASE_URL = "/api/publication-types";

export interface GetPublicationTypesParams {
    includeArchived?: boolean;
    personId?: string | null;
}

export async function getPublicationTypes(
    params?: GetPublicationTypesParams
): Promise<PublicationType[]> {
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
        throw new Error(error.error || "Failed to fetch publication types");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPublicationType) : [];
}

export async function createPublicationType(
    publicationType: NewPublicationType
): Promise<PublicationType> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(publicationType),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create publication type");
    }

    const { data } = await response.json();
    return transformPublicationType(data);
}

export async function updatePublicationType(
    id: string,
    updates: Partial<PublicationType>
): Promise<PublicationType> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update publication type");
    }

    const { data } = await response.json();
    return transformPublicationType(data);
}

export async function deletePublicationType(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete publication type");
    }
}

