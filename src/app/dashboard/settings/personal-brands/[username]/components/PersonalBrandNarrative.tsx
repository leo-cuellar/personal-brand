"use client";

import { useEffect } from "react";
import { BrandNarrative } from "../../../../../../../services/supabase/schemas";

// Field descriptions matching the schema comments
const FIELD_DESCRIPTIONS = {
    immediateCredibility: "Establishes authority and expertise upfront",
    professionalProblemOrChallenge: "The initial problem or challenge that started the journey",
    internalStruggles: "Personal doubts, transitions, and difficult decisions faced internally",
    externalContext: "The external environment, workplace conditions, undervaluation, lack of role models",
    keyMicrotransitions: "Important shifts in focus, new skills acquired, personal evolution",
    insightOrSpark: "The pivotal idea, belief, or vision that changed the direction",
    process: "What was done - learning, changing, applying, adapting",
    resultOrTransformation: "The outcome and transformation (both professional and mental)",
    sharedBeliefs: "What you and your audience feel and seek together",
    currentVisionOrPersonalMission: "Your current vision and personal mission",
    socialProofOrValidation: "Projects, impact, community, results that validate your story",
    callToAction: "Follow-up, connection, invitation to grow together",
} as const;

interface PersonalBrandNarrativeProps {
    username: string;
    narrative: BrandNarrative | null;
    loading: boolean;
    error: string | null;
    onLoad: (username: string) => Promise<void>;
}

export function PersonalBrandNarrative({
    username,
    narrative,
    loading,
    error,
    onLoad,
}: PersonalBrandNarrativeProps) {
    useEffect(() => {
        // Only fetch if narrative is not already loaded
        if (narrative === null && !loading) {
            onLoad(username);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-sm text-gray-600">Loading narrative...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!narrative) {
        return (
            <div className="text-sm text-gray-400">No narrative data available</div>
        );
    }

    return (
        <div className="space-y-4">
            {Object.entries(FIELD_DESCRIPTIONS).map(([key, description]) => {
                const value = narrative[key as keyof BrandNarrative] as string;
                return (
                    <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="mb-1 text-sm font-semibold text-gray-900">
                            {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())
                                .trim()}
                        </div>
                        <div className="mb-2 text-xs italic text-gray-500">
                            {description}
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {value || <span className="text-gray-400">(empty)</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

