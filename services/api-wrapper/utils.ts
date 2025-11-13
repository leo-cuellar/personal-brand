import {
    PublicationType,
    PublicationCategory,
    PublicationIdea,
    PersonalBrand,
    Inspiration,
    PublicationStructure,
    BrandNarrative,
    SocialAccounts,
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
    username: string;
    social_accounts?: {
        linkedin?: {
            profile_url: string;
            profile_name: string;
        };
        twitter?: {
            profile_url: string;
            profile_name: string;
        };
        instagram?: {
            profile_url: string;
            profile_name: string;
        };
        [key: string]: {
            profile_url: string;
            profile_name: string;
        } | undefined;
    } | null;
    brand_narrative?: {
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
    } | string | null;
    strong_opinions?: string[] | null;
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
    // Process social_accounts
    let socialAccounts: SocialAccounts = {};
    if ("social_accounts" in data && data.social_accounts !== null && data.social_accounts !== undefined) {
        if (typeof data.social_accounts === "object") {
            socialAccounts = data.social_accounts as SocialAccounts;
        } else if (typeof data.social_accounts === "string") {
            try {
                const parsed = JSON.parse(data.social_accounts);
                if (parsed && typeof parsed === "object") {
                    socialAccounts = parsed as SocialAccounts;
                }
            } catch {
                // If parsing fails, use empty object
            }
        }
    }

    // Build base result with required fields
    const result: Partial<PersonalBrand> & {
        id: string;
        name: string;
        username: string;
        socialAccounts: SocialAccounts;
        createdAt: Date;
        updatedAt: Date;
        isArchived: boolean;
    } = {
        id: data.id,
        name: data.name,
        username: data.username,
        socialAccounts: socialAccounts,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };

    // Only process brand_narrative if it exists in the response
    if ("brand_narrative" in data && data.brand_narrative !== null && data.brand_narrative !== undefined) {
        let brandNarrative: BrandNarrative | null = null;

        if (typeof data.brand_narrative === "string") {
            // Parse JSON string
            try {
                const parsed = JSON.parse(data.brand_narrative);
                if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
                    brandNarrative = parsed as BrandNarrative;
                }
            } catch {
                // If parsing fails, leave as null
            }
        } else if (typeof data.brand_narrative === "object" && data.brand_narrative !== null) {
            // Already an object
            const obj = data.brand_narrative as Record<string, unknown>;
            if (Object.keys(obj).length > 0) {
                brandNarrative = obj as unknown as BrandNarrative;
            }
        }

        // Only include brandNarrative if we successfully parsed it
        if (brandNarrative) {
            result.brandNarrative = brandNarrative;
        }
    }

    // Only process strong_opinions if it exists in the response
    if ("strong_opinions" in data && data.strong_opinions !== null && data.strong_opinions !== undefined) {
        let strongOpinions: string[] | null = null;

        if (Array.isArray(data.strong_opinions)) {
            strongOpinions = data.strong_opinions;
        } else if (typeof data.strong_opinions === "string") {
            try {
                const parsed = JSON.parse(data.strong_opinions);
                if (Array.isArray(parsed)) {
                    strongOpinions = parsed;
                }
            } catch {
                // If parsing fails, leave as null
            }
        }

        // Only include strongOpinions if we successfully parsed it
        if (strongOpinions !== null) {
            result.strongOpinions = strongOpinions;
        }
    }

    // Return with defaults for fields that weren't present
    return {
        ...result,
        brandNarrative: result.brandNarrative ?? {
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
        },
        strongOpinions: result.strongOpinions ?? [],
        socialAccounts: result.socialAccounts ?? {},
    } as PersonalBrand;
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



