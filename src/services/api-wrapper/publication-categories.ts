import { PublicationCategory, NewPublicationCategory } from "@/services/supabase/schemas";
import { transformPublicationCategory } from "./utils";

const API_BASE_URL = "/api/publication-categories";

export interface GetPublicationCategoriesParams {
    includeArchived?: boolean;
    personId?: string | null;
}

export async function getPublicationCategories(
    params?: GetPublicationCategoriesParams
): Promise<PublicationCategory[]> {
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
        throw new Error(error.error || "Failed to fetch publication categories");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPublicationCategory) : [];
}

export async function createPublicationCategory(
    publicationCategory: NewPublicationCategory
): Promise<PublicationCategory> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(publicationCategory),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create publication category");
    }

    const { data } = await response.json();
    return transformPublicationCategory(data);
}

export async function updatePublicationCategory(
    id: string,
    updates: Partial<PublicationCategory>
): Promise<PublicationCategory> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update publication category");
    }

    const { data } = await response.json();
    return transformPublicationCategory(data);
}

export async function deletePublicationCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete publication category");
    }
}

