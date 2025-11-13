"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePersonalBrands } from "@/hooks/usePersonalBrands";
import { NewPersonalBrand } from "../../../../../../services/supabase/schemas";

export function PersonalBrandsPage() {
    const router = useRouter();
    const [showArchived, setShowArchived] = useState(false);
    const { personalBrands, loading, error, getPersonalBrands, create } =
        usePersonalBrands();

    const params = useMemo(
        () => ({ includeArchived: showArchived, includeProfile: false }),
        [showArchived]
    );

    useEffect(() => {
        getPersonalBrands(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);
    const [isCreating, setIsCreating] = useState(false);

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
                    <div className="space-y-3">
                        {personalBrands.map((brand) => (
                            <div
                                key={brand.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {brand.name}
                                    </h3>
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
                                        onClick={() => router.push(`/dashboard/settings/personal-brands/${brand.id}`)}
                                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
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
    }>({
        name: "",
        linkedinProfile: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({
            name: formData.name,
            linkedinProfile: formData.linkedinProfile,
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


