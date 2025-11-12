const API_BASE_URL = "/api/openai";

export interface GenerateCategoryDescriptionParams {
    categoryName: string;
    personId: string;
}

export interface GenerateCategoryDescriptionResponse {
    description: string;
}

export async function generateCategoryDescription(
    params: GenerateCategoryDescriptionParams
): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/category-description`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate category description");
    }

    const data: GenerateCategoryDescriptionResponse = await response.json();
    return data.description;
}

