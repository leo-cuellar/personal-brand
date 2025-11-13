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

    // Extract social_accounts
    let socialAccounts: PersonalBrand["socialAccounts"] = {};
    if (data.social_accounts) {
        if (typeof data.social_accounts === "object") {
            socialAccounts = data.social_accounts as PersonalBrand["socialAccounts"];
        } else if (typeof data.social_accounts === "string") {
            try {
                socialAccounts = JSON.parse(data.social_accounts);
            } catch {
                socialAccounts = {};
            }
        }
    }

    // Transform snake_case to camelCase
    return {
        id: data.id,
        name: data.name,
        socialAccounts: socialAccounts,
        brandNarrative: brandNarrative,
        strongOpinions: strongOpinions,
        createdAt: new Date(data.created_at) as unknown as Date,
        updatedAt: new Date(data.updated_at) as unknown as Date,
        isArchived: data.is_archived,
    };
}

