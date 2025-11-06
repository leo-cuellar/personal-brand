import {
    PublicationType,
    PublicationTopic,
    StrongOpinion,
    PublicationIdea,
    Publication,
} from "@/services/supabase/schemas";

// Supabase response types (snake_case)
interface SupabasePublicationType {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublicationTopic {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabaseStrongOpinion {
    id: string;
    opinion: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublicationIdea {
    id: string;
    idea: string;
    description: string | null;
    source: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublication {
    id: string;
    title: string | null;
    content: string;
    status: string;
    platform: string;
    scheduled_at: string | null;
    published_at: string | null;
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
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

export function transformPublicationTopic(
    data: SupabasePublicationTopic
): PublicationTopic {
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

export function transformStrongOpinion(
    data: SupabaseStrongOpinion
): StrongOpinion {
    return {
        id: data.id,
        opinion: data.opinion,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

export function transformPublicationIdea(
    data: SupabasePublicationIdea
): PublicationIdea {
    return {
        id: data.id,
        idea: data.idea,
        description: data.description,
        source: data.source as "ai" | "manual",
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

export function transformPublication(
    data: SupabasePublication
): Publication {
    return {
        id: data.id,
        title: data.title,
        content: data.content,
        status: data.status as "draft" | "scheduled" | "published",
        platform: data.platform as "linkedin",
        scheduledAt: data.scheduled_at
            ? (new Date(data.scheduled_at) as unknown as Date)
            : null,
        publishedAt: data.published_at
            ? (new Date(data.published_at) as unknown as Date)
            : null,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

