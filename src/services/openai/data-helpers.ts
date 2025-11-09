import { supabaseAdmin } from "@/services/supabase/client";
import { Person, StrongOpinion } from "@/services/supabase/schemas";

export async function getPersonData(personId: string): Promise<Person | null> {
    const { data, error } = await supabaseAdmin
        .from("persons")
        .select("*")
        .eq("id", personId)
        .eq("is_archived", false)
        .single();

    if (error || !data) {
        return null;
    }

    // Transform snake_case to camelCase
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

export async function getStrongOpinions(personId: string): Promise<StrongOpinion[]> {
    const { data, error } = await supabaseAdmin
        .from("strong_opinions")
        .select("*")
        .eq("person_id", personId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    if (error || !data) {
        return [];
    }

    // Transform snake_case to camelCase
    return data.map((item) => ({
        id: item.id,
        personId: item.person_id,
        opinion: item.opinion,
        createdAt: new Date(item.created_at) as unknown as Date,
        updatedAt: new Date(item.updated_at) as unknown as Date,
        isArchived: item.is_archived,
    }));
}

