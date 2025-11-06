import { PublicationType } from "@/services/supabase/schemas";

// Supabase response type (snake_case)
interface SupabasePublicationType {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

// Transform Supabase response (snake_case) to our TypeScript types (camelCase)
export function transformPublicationType(
    data: SupabasePublicationType
): PublicationType {
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isArchived: data.is_archived,
    };
}

