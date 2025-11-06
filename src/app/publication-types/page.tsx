"use client";

import { useState } from "react";
import { usePublicationTypes } from "@/hooks/usePublicationTypes";
import { PublicationType, NewPublicationType } from "@/services/supabase/schemas";

export default function PublicationTypesPage() {
    const { publicationTypes, loading, error, create, update, remove } =
        usePublicationTypes();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<NewPublicationType>({
        name: "",
        description: "",
        isArchived: false,
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await create(formData);
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
        if (confirm("Are you sure you want to delete this publication type?")) {
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
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Publication Types</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    {isCreating ? "Cancel" : "Add New"}
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
                    {error}
                </div>
            )}

            {isCreating && (
                <form
                    onSubmit={handleCreate}
                    className="mb-8 rounded border p-4"
                >
                    <h2 className="mb-4 text-xl font-semibold">Create New Publication Type</h2>
                    <div className="mb-4">
                        <label className="mb-2 block font-medium">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 block font-medium">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full rounded border px-3 py-2"
                            rows={3}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                        Create
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {publicationTypes.length === 0 ? (
                    <p className="text-gray-500">No publication types found.</p>
                ) : (
                    publicationTypes.map((type) => (
                        <div
                            key={type.id}
                            className="rounded border p-4"
                        >
                            {editingId === type.id ? (
                                <EditForm
                                    type={type}
                                    onSave={(updates) => handleUpdate(type.id, updates)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="text-xl font-semibold">{type.name}</h3>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => setEditingId(type.id)}
                                                className="rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleUpdate(type.id, {
                                                        isArchived: !type.isArchived,
                                                    })
                                                }
                                                className="rounded bg-gray-600 px-3 py-1 text-white hover:bg-gray-700"
                                            >
                                                {type.isArchived ? "Unarchive" : "Archive"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{type.description}</p>
                                    {type.isArchived && (
                                        <span className="mt-2 inline-block rounded bg-gray-200 px-2 py-1 text-sm">
                                            Archived
                                        </span>
                                    )}
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
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="mb-2 block font-medium">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border px-3 py-2"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="mb-2 block font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded border px-3 py-2"
                    rows={3}
                    required
                />
            </div>
            <div className="space-x-2">
                <button
                    type="submit"
                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                    Save
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

