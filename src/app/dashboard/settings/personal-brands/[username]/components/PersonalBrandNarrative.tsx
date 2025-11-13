"use client";

import { useEffect, useState } from "react";
import { BrandNarrative } from "../../../../../../../services/supabase/schemas";
import { EditButton } from "@/components/EditButton";
import { IconButton } from "@/components/IconButton";

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
    onUpdate: (username: string, narrative: BrandNarrative) => Promise<void>;
}

export function PersonalBrandNarrative({
    username,
    narrative,
    loading,
    error,
    onLoad,
    onUpdate,
}: PersonalBrandNarrativeProps) {
    const [editingField, setEditingField] = useState<keyof BrandNarrative | null>(null);
    const [fieldValue, setFieldValue] = useState("");

    useEffect(() => {
        // Only fetch if narrative is not already loaded
        if (narrative === null && !loading) {
            onLoad(username);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    const handleEditField = (field: keyof BrandNarrative) => {
        if (!narrative) return;
        setFieldValue(narrative[field] || "");
        setEditingField(field);
    };

    const handleSaveField = async () => {
        if (!narrative || !editingField) return;

        try {
            const updatedNarrative = {
                ...narrative,
                [editingField]: fieldValue,
            };
            await onUpdate(username, updatedNarrative);
            setEditingField(null);
            setFieldValue("");
        } catch (err) {
            console.error("Failed to update narrative field:", err);
            // TODO: Show error message to user
        }
    };

    const handleCancelField = () => {
        setEditingField(null);
        setFieldValue("");
    };

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
                const fieldKey = key as keyof BrandNarrative;
                const value = narrative[fieldKey] as string;
                const isEditing = editingField === fieldKey;

                return (
                    <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="mb-1 flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-900">
                                {key
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())
                                    .trim()}
                            </div>
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <IconButton
                                        icon="check"
                                        onClick={handleSaveField}
                                        iconColor="#10b981"
                                        backgroundColor="#d1fae5"
                                        hoverBackgroundColor="#a7f3d0"
                                    />
                                    <IconButton
                                        icon="close"
                                        onClick={handleCancelField}
                                        iconColor="#ef4444"
                                        backgroundColor="#fee2e2"
                                        hoverBackgroundColor="#fecaca"
                                    />
                                </div>
                            ) : (
                                <EditButton onClick={() => handleEditField(fieldKey)} />
                            )}
                        </div>
                        <div className="mb-2 text-xs italic text-gray-500">
                            {description}
                        </div>
                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    value={fieldValue}
                                    onChange={(e) => setFieldValue(e.target.value)}
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    rows={4}
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                {value || <span className="text-gray-400">(empty)</span>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

