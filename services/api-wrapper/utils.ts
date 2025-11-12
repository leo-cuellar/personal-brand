import {
    PublicationType,
    PublicationCategory,
    StrongOpinion,
    PublicationIdea,
    PersonalBrand,
    Inspiration,
    PublicationStructure,
} from "../supabase/schemas";

// Supabase response types (snake_case)
interface SupabasePublicationType {
    id: string;
    personal_brand_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublicationCategory {
    id: string;
    personal_brand_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
    use_for_search: boolean;
}

interface SupabaseStrongOpinion {
    id: string;
    personal_brand_id: string;
    opinion: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePublicationIdea {
    id: string;
    personal_brand_id: string;
    idea: string;
    description: string | null;
    link: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

interface SupabasePerson {
    id: string;
    name: string;
    linkedin_profile: string | null;
    brand_narrative: {
        immediateCredibility: string;
        professionalProblemOrChallenge: string;
        internalStruggles: string;
        externalContext: string;
        keyMicrotransitions: string;
        insightOrSpark: string;
        process: string;
        resultOrTransformation: string;
        sharedBeliefs: string;
        currentVisionOrPersonalMission: string;
        socialProofOrValidation: string;
        callToAction: string;
    } | null;
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
        personalBrandId: data.personal_brand_id,
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
        personalBrandId: data.personal_brand_id,
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
        personalBrandId: data.personal_brand_id,
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
        personalBrandId: data.personal_brand_id,
        idea: data.idea,
        description: data.description,
        link: data.link || null,
        status: data.status as "in_review" | "accepted" | "rejected" | "used",
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

export function transformPersonalBrand(
    data: SupabasePerson
): PersonalBrand {
    // Extract brand narrative fields
    const brandNarrative = data.brand_narrative || {
        immediateCredibility: "",
        professionalProblemOrChallenge: "",
        internalStruggles: "",
        externalContext: "",
        keyMicrotransitions: "",
        insightOrSpark: "",
        process: "",
        resultOrTransformation: "",
        sharedBeliefs: "",
        currentVisionOrPersonalMission: "",
        socialProofOrValidation: "",
        callToAction: "",
    };

    return {
        id: data.id,
        name: data.name,
        linkedinProfile: data.linkedin_profile,
        brandNarrative: brandNarrative,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

interface SupabaseInspiration {
    id: string;
    personal_brand_id: string;
    text: string;
    link: string | null;
    source: string;
    metadata: unknown;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

export function transformInspiration(
    data: SupabaseInspiration
): Inspiration {
    return {
        id: data.id,
        personalBrandId: data.personal_brand_id,
        text: data.text,
        link: data.link || null,
        source: data.source as "manual" | "trend_scanner" | "linkedin",
        metadata: data.metadata || null,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

interface SupabasePublicationStructure {
    id: string;
    personal_brand_id: string;
    name: string;
    description: string | null;
    structure: unknown;
    created_at: string;
    updated_at: string;
    is_archived: boolean;
}

export function transformPublicationStructure(
    data: SupabasePublicationStructure
): PublicationStructure {
    // Parse JSON structure if it's a string
    let parsedStructure = data.structure;
    if (typeof data.structure === "string") {
        try {
            parsedStructure = JSON.parse(data.structure);
        } catch {
            parsedStructure = {};
        }
    }

    return {
        id: data.id,
        personalBrandId: data.personal_brand_id,
        name: data.name,
        description: data.description,
        structure: parsedStructure,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

