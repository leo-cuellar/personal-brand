"use client";

import { useState, useEffect, useMemo } from "react";
import { usePersonalBrands } from "@/hooks/usePersonalBrands";
import { PersonalBrand, NewPersonalBrand, BrandNarrative } from "../../../../../../services/supabase/schemas";

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

function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        return "Invalid date";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function PersonalBrandsPage() {
    const [showArchived, setShowArchived] = useState(false);
    const { personalBrands, loading, error, getPersonalBrands, create, update, remove } =
        usePersonalBrands();

    const params = useMemo(
        () => ({ includeArchived: showArchived }),
        [showArchived]
    );

    useEffect(() => {
        getPersonalBrands(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this personal brand? This action cannot be undone.")) {
            try {
                await remove(id);
            } catch (err) {
                console.error("Failed to delete:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading personal brands...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Personal Brands
                </h1>
                <p className="text-gray-600">
                    Manage personal brands for content generation
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Show archived</span>
                    </label>
                    <span className="text-sm text-gray-500">
                        {personalBrands.length} personal brand{personalBrands.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {isCreating ? "Cancel" : "+ Add New Personal Brand"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Create New Personal Brand
                    </h2>
                    <CreateForm
                        onSave={async (data) => {
                            await create(data);
                            setIsCreating(false);
                        }}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            )}

            <div className="space-y-6">
                {personalBrands.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            {showArchived
                                ? "No personal brands found."
                                : "No active personal brands. Create one to get started!"}
                        </p>
                    </div>
                ) : (
                    personalBrands.map((brand) => (
                        <div
                            key={brand.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${brand.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            {editingId === brand.id ? (
                                <EditForm
                                    personalBrand={brand}
                                    onSave={async (updates) => {
                                        await update(brand.id, updates);
                                        setEditingId(null);
                                    }}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {brand.name}
                                                </h2>
                                                {brand.isArchived && (
                                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            {brand.linkedinProfile && (
                                                <a
                                                    href={brand.linkedinProfile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {brand.linkedinProfile}
                                                </a>
                                            )}
                                        </div>
                                        <div className="ml-4 flex gap-2">
                                            <button
                                                onClick={() => setEditingId(brand.id)}
                                                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    update(brand.id, {
                                                        isArchived: !brand.isArchived,
                                                    })
                                                }
                                                className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                            >
                                                {brand.isArchived ? "Unarchive" : "Archive"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(FIELD_DESCRIPTIONS).map(([key, description]) => {
                                            const value = brand.brandNarrative[key as keyof BrandNarrative] as string;
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
                                    <div className="mt-6 border-t border-gray-200 pt-4">
                                        <div className="mb-2 text-sm font-semibold text-gray-900">
                                            Strong Opinions
                                        </div>
                                        <div className="mb-2 text-xs italic text-gray-500">
                                            Strong opinions for content generation
                                        </div>
                                        {brand.strongOpinions && brand.strongOpinions.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                                                {brand.strongOpinions.map((opinion, index) => (
                                                    <li key={index} className="whitespace-pre-wrap">{opinion}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-400">(no strong opinions)</div>
                                        )}
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        Created: {formatDate(brand.createdAt)} •
                                        Updated: {formatDate(brand.updatedAt)}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function CreateForm({
    onSave,
    onCancel,
}: {
    onSave: (data: NewPersonalBrand) => Promise<void>;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<{
        name: string;
        linkedinProfile: string | null;
        brandNarrative: BrandNarrative;
        strongOpinions: string[];
    }>({
        name: "",
        linkedinProfile: null,
        brandNarrative: {
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
        strongOpinions: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            name: formData.name,
            linkedinProfile: formData.linkedinProfile,
            brandNarrative: formData.brandNarrative,
            strongOpinions: formData.strongOpinions,
        });
    };

    const addOpinion = () => {
        setFormData({
            ...formData,
            strongOpinions: [...formData.strongOpinions, ""],
        });
    };

    const updateOpinion = (index: number, value: string) => {
        const newOpinions = [...formData.strongOpinions];
        newOpinions[index] = value;
        setFormData({
            ...formData,
            strongOpinions: newOpinions,
        });
    };

    const removeOpinion = (index: number) => {
        const newOpinions = formData.strongOpinions.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            strongOpinions: newOpinions,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Leo Cuellar"
                    required
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    LinkedIn Profile
                </label>
                <input
                    type="url"
                    value={formData.linkedinProfile || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, linkedinProfile: e.target.value || null })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/username"
                />
            </div>
            {Object.entries(FIELD_DESCRIPTIONS).map(([key, description]) => (
                <div key={key}>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim()}{" "}
                        *
                    </label>
                    <div className="mb-2 text-xs italic text-gray-500">
                        {description}
                    </div>
                    <textarea
                        value={formData.brandNarrative[key as keyof BrandNarrative] as string}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                brandNarrative: {
                                    ...formData.brandNarrative,
                                    [key]: e.target.value,
                                },
                            })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                    />
                </div>
            ))}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        Strong Opinions
                    </label>
                    <button
                        type="button"
                        onClick={addOpinion}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Add Opinion
                    </button>
                </div>
                <div className="mb-2 text-xs italic text-gray-500">
                    Strong opinions for content generation
                </div>
                <div className="space-y-2">
                    {formData.strongOpinions.map((opinion, index) => (
                        <div key={index} className="flex gap-2">
                            <textarea
                                value={opinion}
                                onChange={(e) => updateOpinion(index, e.target.value)}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                                placeholder="Enter a strong opinion..."
                            />
                            <button
                                type="button"
                                onClick={() => removeOpinion(index)}
                                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    {formData.strongOpinions.length === 0 && (
                        <div className="text-sm text-gray-400 italic">No strong opinions added yet</div>
                    )}
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Create
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

function EditForm({
    personalBrand,
    onSave,
    onCancel,
}: {
    personalBrand: PersonalBrand;
    onSave: (updates: Partial<PersonalBrand>) => Promise<void>;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<{
        name: string;
        linkedinProfile: string | null;
        brandNarrative: BrandNarrative;
        strongOpinions: string[];
    }>({
        name: personalBrand.name,
        linkedinProfile: personalBrand.linkedinProfile,
        brandNarrative: personalBrand.brandNarrative || {
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
        strongOpinions: personalBrand.strongOpinions || [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            name: formData.name,
            linkedinProfile: formData.linkedinProfile,
            brandNarrative: formData.brandNarrative,
            strongOpinions: formData.strongOpinions,
        });
    };

    const addOpinion = () => {
        setFormData({
            ...formData,
            strongOpinions: [...formData.strongOpinions, ""],
        });
    };

    const updateOpinion = (index: number, value: string) => {
        const newOpinions = [...formData.strongOpinions];
        newOpinions[index] = value;
        setFormData({
            ...formData,
            strongOpinions: newOpinions,
        });
    };

    const removeOpinion = (index: number) => {
        const newOpinions = formData.strongOpinions.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            strongOpinions: newOpinions,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Name *
                </label>
                <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    LinkedIn Profile
                </label>
                <input
                    type="url"
                    value={formData.linkedinProfile || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, linkedinProfile: e.target.value || null })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/username"
                />
            </div>
            {Object.entries(FIELD_DESCRIPTIONS).map(([key, description]) => (
                <div key={key}>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .trim()}{" "}
                        *
                    </label>
                    <div className="mb-2 text-xs italic text-gray-500">
                        {description}
                    </div>
                    <textarea
                        value={formData.brandNarrative[key as keyof BrandNarrative] as string}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                brandNarrative: {
                                    ...formData.brandNarrative,
                                    [key]: e.target.value,
                                },
                            })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                    />
                </div>
            ))}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        Strong Opinions
                    </label>
                    <button
                        type="button"
                        onClick={addOpinion}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Add Opinion
                    </button>
                </div>
                <div className="mb-2 text-xs italic text-gray-500">
                    Strong opinions for content generation
                </div>
                <div className="space-y-2">
                    {formData.strongOpinions.map((opinion, index) => (
                        <div key={index} className="flex gap-2">
                            <textarea
                                value={opinion}
                                onChange={(e) => updateOpinion(index, e.target.value)}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                                placeholder="Enter a strong opinion..."
                            />
                            <button
                                type="button"
                                onClick={() => removeOpinion(index)}
                                className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    {formData.strongOpinions.length === 0 && (
                        <div className="text-sm text-gray-400 italic">No strong opinions added yet</div>
                    )}
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    type="submit"
                    className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

