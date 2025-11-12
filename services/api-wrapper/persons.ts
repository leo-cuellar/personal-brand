import { Person, NewPerson } from "../supabase/schemas";
import { transformPerson } from "./utils";

const API_BASE_URL = "/api/persons";

export interface GetPersonsParams {
    includeArchived?: boolean;
}

export async function getPersons(
    params?: GetPersonsParams
): Promise<Person[]> {
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
        throw new Error(error.error || "Failed to fetch persons");
    }

    const { data } = await response.json();
    return Array.isArray(data) ? data.map(transformPerson) : [];
}

export async function createPerson(
    person: NewPerson
): Promise<Person> {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(person),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create person");
    }

    const { data } = await response.json();
    return transformPerson(data);
}

export async function updatePerson(
    id: string,
    updates: Partial<Person>
): Promise<Person> {
    const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update person");
    }

    const { data } = await response.json();
    return transformPerson(data);
}

export async function deletePerson(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete person");
    }
}

