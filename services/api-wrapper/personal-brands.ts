import { PersonalBrand, NewPersonalBrand } from "../supabase/schemas";
import { transformPersonalBrand } from "./utils";

const API_BASE_URL = "/api/personal-brands";

export interface GetPersonalBrandsParams {
    includeArchived?: boolean;
    includeProfile?: boolean; // If false, excludes brand_narrative and strong_opinions to reduce payload size
}

export async function getPersonalBrands(
    params?: GetPersonalBrandsParams
): Promise<PersonalBrand[]> {
    const queryParams = new URLSearchParams();
    if (params?.includeArchived) {
        queryParams.append("includeArchived", "true");
    }
    if (params?.includeProfile === false) {
        queryParams.append("includeProfile", "false");
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
        throw new Error(error.error || "Failed to fetch personal brands");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPersonalBrand) : [];
}

export interface GetPersonalBrandByUsernameParams {
    fields?: "basic" | "narrative" | "opinions" | "all"; // What fields to include
}

export async function getPersonalBrandByUsername(
    username: string,
    params?: GetPersonalBrandByUsernameParams
): Promise<PersonalBrand> {
    const queryParams = new URLSearchParams();
    if (params?.fields) {
        queryParams.append("fields", params.fields);
    }

    const url = `${API_BASE_URL}/${encodeURIComponent(username)}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch personal brand");
    }

    const { data } = await response.json();
    // Data is already transformed by the API route, so return it directly
    // The API route calls transformPersonalBrand before sending the response
    return data as PersonalBrand;
}

export async function createPersonalBrand(
    personalBrand: NewPersonalBrand
): Promise<PersonalBrand> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(personalBrand),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create personal brand");
    }

    const { data } = await response.json();
    return transformPersonalBrand(data);
}

export async function updatePersonalBrand(
    id: string,
    updates: Partial<PersonalBrand>
): Promise<PersonalBrand> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update personal brand");
    }

    const { data } = await response.json();
    return transformPersonalBrand(data);
}

export async function getPersonalBrandNarrative(username: string): Promise<PersonalBrand["brandNarrative"]> {
    const personalBrand = await getPersonalBrandByUsername(username, { fields: "narrative" });
    return personalBrand.brandNarrative;
}

export async function updatePersonalBrandNarrative(
    username: string,
    brandNarrative: PersonalBrand["brandNarrative"]
): Promise<PersonalBrand["brandNarrative"]> {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(username)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ brandNarrative }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update brand narrative");
    }

    const { data } = await response.json();
    return data.brandNarrative;
}

export async function getPersonalBrandOpinions(username: string): Promise<string[]> {
    const personalBrand = await getPersonalBrandByUsername(username, { fields: "opinions" });
    return personalBrand.strongOpinions;
}

export async function updatePersonalBrandOpinions(
    username: string,
    strongOpinions: string[]
): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(username)}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ strongOpinions }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update strong opinions");
    }

    const { data } = await response.json();
    return data.strongOpinions;
}

export async function deletePersonalBrand(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete personal brand");
    }
}

