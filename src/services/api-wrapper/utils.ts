import {
    PublicationType,
    PublicationCategory,
    StrongOpinion,
    PublicationIdea,
    Publication,
    Person,
    Inspiration,
} from "@/services/supabase/schemas";

// Supabase response types (snake_case)
interface SupabasePublicationType {
    id: string;
    person_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublicationCategory {
    id: string;
    person_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    use_for_search: boolean;
}

interface SupabaseStrongOpinion {
    id: string;
    person_id: string;
    opinion: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublicationIdea {
    id: string;
    person_id: string;
    idea: string;
    description: string | null;
    link: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublication {
    id: string;
    person_id: string;
    title: string | null;
    content: string;
    status: string;
    platform: string;
    scheduled_at: string | null;
    published_at: string | null;
    source: string | null;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePerson {
    id: string;
    name: string;
    linkedin_profile: string | null;
    immediate_credibility: string;
    professional_problem_or_challenge: string;
    internal_struggles: string;
    external_context: string;
    key_microtransitions: string;
    insight_or_spark: string;
    process: string;
    result_or_transformation: string;
    shared_beliefs: string;
    current_vision_or_personal_mission: string;
    social_proof_or_validation: string;
    call_to_action: string;
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
        personId: data.person_id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

export function transformPublicationCategory(
    data: SupabasePublicationCategory
): PublicationCategory {
    return {
        id: data.id,
        personId: data.person_id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
        useForSearch: data.use_for_search,
    };
}

export function transformStrongOpinion(
    data: SupabaseStrongOpinion
): StrongOpinion {
    return {
        id: data.id,
        personId: data.person_id,
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
        personId: data.person_id,
        idea: data.idea,
        description: data.description,
        link: data.link || null,
        status: data.status as "in_review" | "accepted" | "rejected" | "used",
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
        personId: data.person_id,
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
        source: data.source || null,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

export function transformPerson(
    data: SupabasePerson
): Person {
    return {
        id: data.id,
        name: data.name,
        linkedinProfile: data.linkedin_profile,
        immediateCredibility: data.immediate_credibility,
        professionalProblemOrChallenge: data.professional_problem_or_challenge,
        internalStruggles: data.internal_struggles,
        externalContext: data.external_context,
        keyMicrotransitions: data.key_microtransitions,
        insightOrSpark: data.insight_or_spark,
        process: data.process,
        resultOrTransformation: data.result_or_transformation,
        sharedBeliefs: data.shared_beliefs,
        currentVisionOrPersonalMission: data.current_vision_or_personal_mission,
        socialProofOrValidation: data.social_proof_or_validation,
        callToAction: data.call_to_action,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

interface SupabaseInspiration {
    id: string;
    person_id: string;
    text: string;
    link: string | null;
    source: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

export function transformInspiration(
    data: SupabaseInspiration
): Inspiration {
    return {
        id: data.id,
        personId: data.person_id,
        text: data.text,
        link: data.link || null,
        source: data.source as "manual" | "trend_scanner",
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

