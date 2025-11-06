import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/services/supabase/client";
import { Person, NewPerson } from "@/services/supabase/schemas";

// GET - Get all persons
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";

        let query = supabaseAdmin
            .from("persons")
            .select("*")
            .order("created_at", { ascending: false });

        if (!includeArchived) {
            query = query.eq("is_archived", false);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch persons" },
            { status: 500 }
        );
    }
}

// POST - Create a new person
export async function POST(request: NextRequest) {
    try {
        const body: NewPerson = await request.json();

        const { data, error } = await supabaseAdmin
            .from("persons")
            .insert({
                name: body.name,
                linkedin_profile: body.linkedinProfile || null,
                immediate_credibility: body.immediateCredibility,
                professional_problem_or_challenge: body.professionalProblemOrChallenge,
                internal_struggles: body.internalStruggles,
                external_context: body.externalContext,
                key_microtransitions: body.keyMicrotransitions,
                insight_or_spark: body.insightOrSpark,
                process: body.process,
                result_or_transformation: body.resultOrTransformation,
                shared_beliefs: body.sharedBeliefs,
                current_vision_or_personal_mission: body.currentVisionOrPersonalMission,
                social_proof_or_validation: body.socialProofOrValidation,
                call_to_action: body.callToAction,
                is_archived: body.isArchived || false,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Failed to create person" },
            { status: 500 }
        );
    }
}

// PUT - Update a person
export async function PUT(request: NextRequest) {
    try {
        const body: Partial<Person> & { id: string } =
            await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData: {
            name?: string;
            linkedin_profile?: string | null;
            immediate_credibility?: string;
            professional_problem_or_challenge?: string;
            internal_struggles?: string;
            external_context?: string;
            key_microtransitions?: string;
            insight_or_spark?: string;
            process?: string;
            result_or_transformation?: string;
            shared_beliefs?: string;
            current_vision_or_personal_mission?: string;
            social_proof_or_validation?: string;
            call_to_action?: string;
            is_archived?: boolean;
            updated_at: string;
        } = {
            updated_at: new Date().toISOString(),
        };

        if (body.name !== undefined) updateData.name = body.name;
        if (body.linkedinProfile !== undefined)
            updateData.linkedin_profile = body.linkedinProfile || null;
        if (body.immediateCredibility !== undefined)
            updateData.immediate_credibility = body.immediateCredibility;
        if (body.professionalProblemOrChallenge !== undefined)
            updateData.professional_problem_or_challenge = body.professionalProblemOrChallenge;
        if (body.internalStruggles !== undefined)
            updateData.internal_struggles = body.internalStruggles;
        if (body.externalContext !== undefined)
            updateData.external_context = body.externalContext;
        if (body.keyMicrotransitions !== undefined)
            updateData.key_microtransitions = body.keyMicrotransitions;
        if (body.insightOrSpark !== undefined)
            updateData.insight_or_spark = body.insightOrSpark;
        if (body.process !== undefined) updateData.process = body.process;
        if (body.resultOrTransformation !== undefined)
            updateData.result_or_transformation = body.resultOrTransformation;
        if (body.sharedBeliefs !== undefined)
            updateData.shared_beliefs = body.sharedBeliefs;
        if (body.currentVisionOrPersonalMission !== undefined)
            updateData.current_vision_or_personal_mission = body.currentVisionOrPersonalMission;
        if (body.socialProofOrValidation !== undefined)
            updateData.social_proof_or_validation = body.socialProofOrValidation;
        if (body.callToAction !== undefined)
            updateData.call_to_action = body.callToAction;
        if (body.isArchived !== undefined)
            updateData.is_archived = body.isArchived;

        const { data, error } = await supabaseAdmin
            .from("persons")
            .update(updateData)
            .eq("id", body.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ data });
    } catch {
        return NextResponse.json(
            { error: "Failed to update person" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a person (permanent delete)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("persons")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Failed to delete person" },
            { status: 500 }
        );
    }
}

