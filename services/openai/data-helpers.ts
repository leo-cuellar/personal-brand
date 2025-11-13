import { supabaseAdmin } from "../supabase/client";
import { PersonalBrand } from "../supabase/schemas";

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

    // Extract strong opinions - handle both array and null/undefined
    let strongOpinions: string[] = [];
    if (data.strong_opinions) {
        if (Array.isArray(data.strong_opinions)) {
            strongOpinions = data.strong_opinions;
        } else if (typeof data.strong_opinions === "string") {
            try {
                strongOpinions = JSON.parse(data.strong_opinions);
            } catch {
                strongOpinions = [];
            }
        }
    }

    // Transform snake_case to camelCase
    return {
        id: data.id,
        name: data.name,
        linkedinProfile: data.linkedin_profile,
        brandNarrative: brandNarrative,
        strongOpinions: strongOpinions,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

