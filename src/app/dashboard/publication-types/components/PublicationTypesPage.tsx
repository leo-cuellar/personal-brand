"use client";

import { useState, useEffect, useMemo } from "react";
import { usePublicationTypes } from "@/hooks/usePublicationTypes";
import { PublicationType, NewPublicationType } from "../../../../../services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

// Helper function to format dates consistently (avoiding hydration mismatch)
function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    // Check if date is valid
    if (isNaN(d.getTime())) {
        return "Invalid date";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function PublicationTypesPage() {
    const { selectedPersonId } = usePersonContext();
    const [showArchived, setShowArchived] = useState(false);
    const { publicationTypes, loading, error, getPublicationTypes, create, update, remove } =
        usePublicationTypes();

    // Memoize params to prevent infinite loops
    const params = useMemo(
        () => ({ includeArchived: showArchived }),
        [showArchived]
    );

    useEffect(() => {
        getPublicationTypes(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<NewPublicationType>>({
        name: "",
        description: "",
        isArchived: false,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPersonId) {
            alert("Please select a person first");
            return;
        }
        if (!formData.name || !formData.description) {
            alert("Name and description are required");
            return;
        }
        try {
            await create({
                name: formData.name,
                description: formData.description,
                isArchived: formData.isArchived || false,
            } as NewPublicationType);
            setFormData({ name: "", description: "", isArchived: false });
            setIsCreating(false);
        } catch (err) {
            console.error("Failed to create:", err);
        }
    };

    const handleUpdate = async (id: string, updates: Partial<PublicationType>) => {
        try {
            await update(id, updates);
            setEditingId(null);
        } catch (err) {
            console.error("Failed to update:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this publication type? This action cannot be undone.")) {
            try {
                await remove(id);
            } catch (err) {
                console.error("Failed to delete:", err);
            }
        }
    };

    // No need to filter locally since the hook handles it via API
    const filteredTypes = publicationTypes;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading publication types...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Publication Types
                </h1>
                <p className="text-gray-600">
                    Manage your publication types for content generation
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
                        {filteredTypes.length} type{filteredTypes.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    disabled={!selectedPersonId}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    title={!selectedPersonId ? "Please select a person first" : ""}
                >
                    {isCreating ? "Cancel" : "+ Add New Type"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Create New Publication Type
                    </h2>
                    {!selectedPersonId && (
                        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                            <strong>⚠️ Warning:</strong> Please select a person from the header before creating a type.
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
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
                                placeholder="e.g., Actionable, Motivational"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Describe what this publication type is for..."
                                required
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
                                onClick={() => {
                                    setIsCreating(false);
                                    setFormData({ name: "", description: "", isArchived: false });
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {filteredTypes.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            {showArchived
                                ? "No publication types found."
                                : "No active publication types. Create one to get started!"}
                        </p>
                    </div>
                ) : (
                    filteredTypes.map((type) => (
                        <div
                            key={type.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${type.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            {editingId === type.id ? (
                                <EditForm
                                    type={type}
                                    onSave={(updates) => handleUpdate(type.id, updates)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {type.name}
                                                </h3>
                                                {type.isArchived && (
                                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600">{type.description}</p>
                                        </div>
                                        <div className="ml-4 flex gap-2">
                                            <button
                                                onClick={() => setEditingId(type.id)}
                                                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleUpdate(type.id, {
                                                        isArchived: !type.isArchived,
                                                    })
                                                }
                                                className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                            >
                                                {type.isArchived ? "Unarchive" : "Archive"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Created: {formatDate(type.createdAt)} •
                                        Updated: {formatDate(type.updatedAt)}
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

function EditForm({
    type,
    onSave,
    onCancel,
}: {
    type: PublicationType;
    onSave: (updates: Partial<PublicationType>) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(type.name);
    const [description, setDescription] = useState(type.description);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Name *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description *
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                />
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

