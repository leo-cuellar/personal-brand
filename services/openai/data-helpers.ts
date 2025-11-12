import { supabaseAdmin } from "../supabase/client";
import { PersonalBrand, StrongOpinion } from "../supabase/schemas";

export async function getPersonalBrandData(personalBrandId: string): Promise<PersonalBrand | null> {
    const { data, error } = await supabaseAdmin
        .from("personal_brands")
        .select("*")
        .eq("id", personalBrandId)
        .eq("is_archived", false)
        .single();

    if (error || !data) {
        return null;
    }

    // Extract brand narrative fields
    const brandNarrative = (data.brand_narrative || {
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
    }) as PersonalBrand["brandNarrative"];

    // Transform snake_case to camelCase
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

export async function getStrongOpinions(personalBrandId: string): Promise<StrongOpinion[]> {
    const { data, error } = await supabaseAdmin
        .from("strong_opinions")
        .select("*")
        .eq("personal_brand_id", personalBrandId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    if (error || !data) {
        return [];
    }

    // Transform snake_case to camelCase
    return data.map((item) => ({
        id: item.id,
        personalBrandId: item.personal_brand_id,
        opinion: item.opinion,
        createdAt: new Date(item.created_at) as unknown as Date,
        updatedAt: new Date(item.updated_at) as unknown as Date,
        isArchived: item.is_archived,
    }));
}

