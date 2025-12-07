import { supabaseAdmin } from "../../../../../../services/supabase/client";

export interface GetContextResult {
    personalBrand: unknown;
    publicationTypes: unknown[];
    publicationStructures: unknown[];
    readerPersonas: unknown[];
}

// Fields to include for personal brand query
const PERSONAL_BRAND_FIELDS = "id, niche, brand_narrative, strong_opinions, values";

// Fields to include for publication types query
const PUBLICATION_TYPES_FIELDS = "id, name, description";

// Fields to include for publication structures query
const PUBLICATION_STRUCTURES_FIELDS = "id, name, description, structure";

// Fields to include for reader personas query
const READER_PERSONAS_FIELDS = "id, name, description, goals, frustrations, desires, knowledge_level";

export async function getContext(
    personalBrandId: string
): Promise<GetContextResult> {

    // Get personal brand information (excluding: name, username, scheduler_id, social_accounts, created_at, updated_at, is_archived)
    const { data: personalBrand, error: personalBrandError } = await supabaseAdmin
        .from("personal_brands")
        .select(PERSONAL_BRAND_FIELDS)
        .eq("id", personalBrandId)
        .eq("is_archived", false)
        .single();

    if (personalBrandError || !personalBrand) {
        throw new Error("Personal brand not found");
    }

    // Get publication types for the specified personal brand (excluding: personal_brand_id, created_at, updated_at, is_archived)
    const { data: publicationTypes, error: typesError } = await supabaseAdmin
        .from("publication_types")
        .select(PUBLICATION_TYPES_FIELDS)
        .eq("personal_brand_id", personalBrandId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    if (typesError) {
        throw new Error(`Failed to fetch publication types: ${typesError.message}`);
    }

    // Get publication structures for the specified personal brand (excluding: personal_brand_id, created_at, updated_at, is_archived)
    const { data: publicationStructures, error: structuresError } = await supabaseAdmin
        .from("publication_structures")
        .select(PUBLICATION_STRUCTURES_FIELDS)
        .eq("personal_brand_id", personalBrandId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    if (structuresError) {
        throw new Error(`Failed to fetch publication structures: ${structuresError.message}`);
    }

    // Get reader personas for the specified personal brand (excluding: personal_brand_id, created_at, updated_at, is_archived)
    const { data: readerPersonas, error: personasError } = await supabaseAdmin
        .from("buyer_personas")
        .select(READER_PERSONAS_FIELDS)
        .eq("personal_brand_id", personalBrandId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

    if (personasError) {
        throw new Error(`Failed to fetch reader personas: ${personasError.message}`);
    }

    return {
        personalBrand,
        publicationTypes: publicationTypes || [],
        publicationStructures: publicationStructures || [],
        readerPersonas: readerPersonas || [],
    };
}
