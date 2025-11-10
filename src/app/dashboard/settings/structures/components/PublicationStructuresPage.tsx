"use client";

import { useState, useMemo } from "react";
import { usePublicationStructures } from "@/hooks/usePublicationStructures";
import { PublicationStructure, NewPublicationStructure } from "@/services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";

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

type StructureField = {
    key: string;
    description: string;
    example: string;
};

export function PublicationStructuresPage() {
    const { selectedPersonId } = usePersonContext();
    const [showArchived, setShowArchived] = useState(false);
    const params = useMemo(
        () => ({ includeArchived: showArchived }),
        [showArchived]
    );
    const { publicationStructures, loading, error, create, update, remove } =
        usePublicationStructures(params);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        structure: StructureField[];
    }>({
        name: "",
        description: "",
        structure: [],
    });

    const structureToFields = (structure: unknown): StructureField[] => {
        if (!structure) {
            return [];
        }
        // Handle string JSON
        let parsedStructure = structure;
        if (typeof structure === "string") {
            try {
                parsedStructure = JSON.parse(structure);
            } catch {
                return [];
            }
        }
        // Ensure it's an object
        if (typeof parsedStructure !== "object" || Array.isArray(parsedStructure)) {
            return [];
        }
        return Object.entries(parsedStructure as Record<string, unknown>).map(([key, value]) => {
            // Handle both old format (string) and new format (object with description and example)
            if (typeof value === "string") {
                return {
                    key,
                    description: value,
                    example: "",
                };
            }
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                const obj = value as { description?: string; example?: string };
                return {
                    key,
                    description: obj.description || "",
                    example: obj.example || "",
                };
            }
            return {
                key,
                description: "",
                example: "",
            };
        });
    };

    const fieldsToStructure = (fields: StructureField[]): Record<string, { description: string; example: string }> => {
        const result: Record<string, { description: string; example: string }> = {};
        fields.forEach((field) => {
            if (field.key) {
                result[field.key] = {
                    description: field.description,
                    example: field.example,
                };
            }
        });
        return result;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPersonId) {
            alert("Please select a person first from the header");
            return;
        }
        if (!formData.name) {
            alert("Name is required");
            return;
        }
        if (formData.structure.length === 0) {
            alert("At least one field is required in the structure");
            return;
        }
        try {
            await create({
                name: formData.name,
                description: formData.description || null,
                structure: fieldsToStructure(formData.structure),
                isArchived: false,
            } as NewPublicationStructure);
            setFormData({ name: "", description: "", structure: [] });
            setIsCreating(false);
        } catch {
            // Error handled by UI
        }
    };

    const handleUpdate = async (id: string, updates: Partial<PublicationStructure>) => {
        try {
            await update(id, updates);
            setEditingId(null);
        } catch {
            // Error handled by UI
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this publication structure? This action cannot be undone.")) {
            try {
                await remove(id);
            } catch {
                // Error handled by UI
            }
        }
    };

    const addField = () => {
        setFormData({
            ...formData,
            structure: [...formData.structure, { key: "", description: "", example: "" }],
        });
    };

    const removeField = (index: number) => {
        setFormData({
            ...formData,
            structure: formData.structure.filter((_, i) => i !== index),
        });
    };

    const updateField = (index: number, field: Partial<StructureField>) => {
        const newStructure = [...formData.structure];
        newStructure[index] = { ...newStructure[index], ...field };
        setFormData({ ...formData, structure: newStructure });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading publication structures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Publication Structures
                </h1>
                <p className="text-gray-600">
                    Define flexible publication structures with dynamic fields
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
                        {publicationStructures.length} structure{publicationStructures.length !== 1 ? "s" : ""}
                    </span>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    disabled={!selectedPersonId}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    title={!selectedPersonId ? "Please select a person first" : ""}
                >
                    {isCreating ? "Cancel" : "+ Add New Structure"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Create New Publication Structure
                    </h2>
                    {!selectedPersonId && (
                        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                            <strong>⚠️ Warning:</strong> Please select a person from the header before creating a structure.
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
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Problem-Solution Structure"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Describe the purpose of this structure..."
                            />
                        </div>
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Structure Fields *
                                </label>
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    + Add Field
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.structure.map((field, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={field.key}
                                                onChange={(e) => updateField(index, { key: e.target.value })}
                                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Field name (e.g., hook, problem, solution)"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeField(index)}
                                                className="rounded-lg bg-red-50 px-4 py-2 text-red-700 transition-colors hover:bg-red-100"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={field.description}
                                                    onChange={(e) => updateField(index, { description: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Describe what this field is for..."
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Example
                                                </label>
                                                <textarea
                                                    value={field.example}
                                                    onChange={(e) => updateField(index, { example: e.target.value })}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Example text for this field..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {formData.structure.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        No fields added. Click &quot;+ Add Field&quot; to add fields to the structure.
                                    </p>
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
                                onClick={() => {
                                    setIsCreating(false);
                                    setFormData({ name: "", description: "", structure: [] });
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
                {publicationStructures.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            {showArchived
                                ? "No publication structures found."
                                : "No active publication structures. Create one to get started!"}
                        </p>
                    </div>
                ) : (
                    publicationStructures.map((structure) => (
                        <div
                            key={structure.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${structure.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            {editingId === structure.id ? (
                                <EditForm
                                    structure={structure}
                                    onSave={(updates) => handleUpdate(structure.id, updates)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {structure.name}
                                                </h3>
                                                {structure.isArchived && (
                                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            {structure.description && (
                                                <p className="mb-3 text-gray-600">{structure.description}</p>
                                            )}
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <h4 className="mb-2 text-sm font-medium text-gray-700">Structure Fields:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(() => {
                                                        let structureObj = structure.structure;
                                                        if (typeof structureObj === "string") {
                                                            try {
                                                                structureObj = JSON.parse(structureObj);
                                                            } catch {
                                                                structureObj = {};
                                                            }
                                                        }
                                                        if (typeof structureObj !== "object" || Array.isArray(structureObj) || !structureObj) {
                                                            return <span className="text-sm text-gray-500">No fields defined</span>;
                                                        }
                                                        return Object.entries(structureObj as Record<string, unknown>).map(([key, value]) => {
                                                            // Handle both old format (string) and new format (object)
                                                            let description = "";
                                                            let example = "";
                                                            if (typeof value === "string") {
                                                                description = value;
                                                            } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                                                                const obj = value as { description?: string; example?: string };
                                                                description = obj.description || "";
                                                                example = obj.example || "";
                                                            }
                                                            return (
                                                                <div
                                                                    key={key}
                                                                    className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                                                                >
                                                                    <div className="font-medium text-blue-900">{key}</div>
                                                                    {description && (
                                                                        <div className="mt-2 text-sm text-blue-700">
                                                                            <span className="font-medium">Description:</span>
                                                                            <div className="mt-1">{description}</div>
                                                                        </div>
                                                                    )}
                                                                    {example && (
                                                                        <div className="mt-2 text-sm text-blue-600">
                                                                            <span className="font-medium italic">Example:</span>
                                                                            <div className="mt-1 whitespace-pre-wrap italic">{example}</div>
                                                                        </div>
                                                                    )}
                                                                    {!description && !example && (
                                                                        <div className="mt-1 text-sm text-gray-500">No description or example</div>
                                                                    )}
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(structure.id);
                                                    setFormData({
                                                        name: structure.name,
                                                        description: structure.description || "",
                                                        structure: structureToFields(structure.structure),
                                                    });
                                                }}
                                                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleUpdate(structure.id, {
                                                        isArchived: !structure.isArchived,
                                                    })
                                                }
                                                className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                            >
                                                {structure.isArchived ? "Unarchive" : "Archive"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(structure.id)}
                                                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Created: {formatDate(structure.createdAt)} •
                                        Updated: {formatDate(structure.updatedAt)}
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
    structure,
    onSave,
    onCancel,
}: {
    structure: PublicationStructure;
    onSave: (updates: Partial<PublicationStructure>) => void;
    onCancel: () => void;
}) {
    const [name, setName] = useState(structure.name);
    const [description, setDescription] = useState(structure.description || "");
    const [fields, setFields] = useState<StructureField[]>(() => {
        if (!structure.structure) {
            return [];
        }
        let structureObj = structure.structure;
        if (typeof structureObj === "string") {
            try {
                structureObj = JSON.parse(structureObj);
            } catch {
                return [];
            }
        }
        if (typeof structureObj !== "object" || Array.isArray(structureObj)) {
            return [];
        }
        return Object.entries(structureObj as Record<string, unknown>).map(([key, value]) => {
            // Handle both old format (string) and new format (object with description and example)
            if (typeof value === "string") {
                return {
                    key,
                    description: value,
                    example: "",
                };
            }
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                const obj = value as { description?: string; example?: string };
                return {
                    key,
                    description: obj.description || "",
                    example: obj.example || "",
                };
            }
            return {
                key,
                description: "",
                example: "",
            };
        });
    });

    const addField = () => {
        setFields([...fields, { key: "", description: "", example: "" }]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, field: Partial<StructureField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...field };
        setFields(newFields);
    };

    const fieldsToStructure = (fields: StructureField[]): Record<string, string> => {
        const result: Record<string, string> = {};
        fields.forEach((field) => {
            if (field.key) {
                result[field.key] = field.description;
            }
        });
        return result;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fields.length === 0) {
            alert("At least one field is required in the structure");
            return;
        }
        onSave({
            name: name || undefined,
            description: description || undefined,
            structure: fieldsToStructure(fields),
        });
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
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                />
            </div>
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        Structure Fields *
                    </label>
                    <button
                        type="button"
                        onClick={addField}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Add Field
                    </button>
                </div>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={field.key}
                                    onChange={(e) => updateField(index, { key: e.target.value })}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Field name"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeField(index)}
                                    className="rounded-lg bg-red-50 px-4 py-2 text-red-700 transition-colors hover:bg-red-100"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Description
                                    </label>
                                    <textarea
                                        value={field.description}
                                        onChange={(e) => updateField(index, { description: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe what this field is for..."
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Example
                                    </label>
                                    <textarea
                                        value={field.example}
                                        onChange={(e) => updateField(index, { example: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Example text for this field..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
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

