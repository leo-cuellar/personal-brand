"use client";

import { useState, useEffect } from "react";
import { usePublicationStructures } from "@/hooks/usePublicationStructures";
import { PublicationStructure, NewPublicationStructure } from "../../../../../../services/supabase/schemas";
import { usePersonalBrandContext } from "@/contexts/PersonalBrandContext";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/IconButton";

type StructureField = {
    key: string;
    description: string;
    example: string;
};

export function PublicationStructuresPage() {
    const { selectedPersonId } = usePersonalBrandContext();
    const { publicationStructures, loading, error, getPublicationStructures, create, update, remove } =
        usePublicationStructures();

    useEffect(() => {
        getPublicationStructures();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500">
                    {publicationStructures.length} structure{publicationStructures.length !== 1 ? "s" : ""}
                </span>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    disabled={!selectedPersonId}
                    className="w-full rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                type="text"
                                                value={field.key}
                                                onChange={(e) => updateField(index, { key: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-1"
                                                placeholder="Field name (e.g., hook, problem, solution)"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeField(index)}
                                                className="w-full rounded-lg bg-red-50 px-4 py-2 text-red-700 transition-colors hover:bg-red-100 sm:w-auto"
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
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setFormData({ name: "", description: "", structure: [] });
                                }}
                                className="w-full rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
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
                            No publication structures. Create one to get started!
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
                                    <div className="mb-3 flex flex-col space-y-4">
                                        {/* First row: Title/Description and Buttons */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
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
                                                    <p className="text-gray-600">{structure.description}</p>
                                                )}
                                            </div>
                                            <div className="hidden gap-2 shrink-0 sm:flex">
                                                <IconButton
                                                    icon="edit"
                                                    onClick={() => {
                                                        setEditingId(structure.id);
                                                        setFormData({
                                                            name: structure.name,
                                                            description: structure.description || "",
                                                            structure: structureToFields(structure.structure),
                                                        });
                                                    }}
                                                    iconColor="#d97706"
                                                    backgroundColor="#fef3c7"
                                                    hoverBackgroundColor="#fde68a"
                                                />
                                                <IconButton
                                                    icon="delete"
                                                    onClick={() => handleDelete(structure.id)}
                                                    iconColor="#ef4444"
                                                    backgroundColor="#fee2e2"
                                                    hoverBackgroundColor="#fecaca"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 sm:hidden">
                                            <IconButton
                                                icon="edit"
                                                onClick={() => {
                                                    setEditingId(structure.id);
                                                    setFormData({
                                                        name: structure.name,
                                                        description: structure.description || "",
                                                        structure: structureToFields(structure.structure),
                                                    });
                                                }}
                                                iconColor="#d97706"
                                                backgroundColor="#fef3c7"
                                                hoverBackgroundColor="#fde68a"
                                            />
                                            <IconButton
                                                icon="delete"
                                                onClick={() => handleDelete(structure.id)}
                                                iconColor="#ef4444"
                                                backgroundColor="#fee2e2"
                                                hoverBackgroundColor="#fecaca"
                                            />
                                        </div>

                                        {/* Second row: Structure Fields container */}
                                        <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <h4 className="mb-2 text-sm font-medium text-gray-700">Structure Fields:</h4>
                                            <div className="space-y-2">
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
                                                            <StructureFieldCard
                                                                key={key}
                                                                fieldKey={key}
                                                                description={description}
                                                                example={example}
                                                            />
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
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
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    type="text"
                                    value={field.key}
                                    onChange={(e) => updateField(index, { key: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:flex-1"
                                    placeholder="Field name"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeField(index)}
                                    className="w-full rounded-lg bg-red-50 px-4 py-2 text-red-700 transition-colors hover:bg-red-100 sm:w-auto"
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
            <div className="flex flex-col gap-2 sm:flex-row">
                <button
                    type="submit"
                    className="w-full rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

interface StructureFieldCardProps {
    fieldKey: string;
    description: string;
    example: string;
}

function StructureFieldCard({ fieldKey, description, example }: StructureFieldCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full rounded-lg border border-blue-200 bg-blue-50">
            {/* First row: Title and Chevron */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-blue-100"
            >
                <div className="font-medium text-blue-900">{fieldKey}</div>
                <Icon
                    name={isExpanded ? "chevronUp" : "chevronDown"}
                    color="#1e40af"
                    size={14}
                />
            </button>

            {/* Collapsible content: Description and Example */}
            {isExpanded && (
                <div className="border-t border-blue-200 p-3 space-y-3">
                    {description && (
                        <div className="text-sm text-blue-700">
                            <span className="font-medium">Description:</span>
                            <div className="mt-1">{description}</div>
                        </div>
                    )}
                    {example && (
                        <div className="text-sm text-blue-600">
                            <span className="font-medium italic">Example:</span>
                            <div className="mt-1 whitespace-pre-wrap italic">{example}</div>
                        </div>
                    )}
                    {!description && !example && (
                        <div className="text-sm text-gray-500">No description or example</div>
                    )}
                </div>
            )}
        </div>
    );
}

