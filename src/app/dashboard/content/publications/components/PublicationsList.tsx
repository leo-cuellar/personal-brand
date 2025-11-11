"use client";

import { useState } from "react";
import { Publication, NewPublication } from "@/services/supabase/schemas";
import { usePersonContext } from "@/contexts/PersonContext";
import { useLate } from "@/hooks/useLate";

function formatDate(date: Date | string | null): string {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        return "Invalid date";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

interface PublicationsListProps {
    publications: Publication[];
    onCreate: (data: NewPublication) => Promise<Publication>;
    onUpdate: (id: string, updates: Partial<Publication>) => Promise<Publication>;
    onDelete: (id: string) => Promise<void>;
}

export function PublicationsList({
    publications,
    onCreate,
    onUpdate,
    onDelete,
}: PublicationsListProps) {
    const { selectedPersonId } = usePersonContext();
    const { schedulePublication, loading: lateLoading, error: lateError } = useLate();
    const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set());
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [schedulingId, setSchedulingId] = useState<string | null>(null);
    const [showScheduleInputs, setShowScheduleInputs] = useState<Set<string>>(new Set());
    const [scheduleInputs, setScheduleInputs] = useState<Record<string, { date: string; time: string }>>({});
    const [formData, setFormData] = useState<Partial<NewPublication>>({
        title: null,
        content: "",
        status: "draft",
        platform: "linkedin",
        scheduledAt: null,
        publishedAt: null,
        source: null,
        isArchived: false,
    });
    const [scheduleDateTime, setScheduleDateTime] = useState({
        date: "",
        time: "",
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPersonId) {
            alert("Please select a person first from the header");
            return;
        }
        if (!formData.content) {
            alert("Content is required");
            return;
        }
        try {
            await onCreate({
                content: formData.content,
                title: formData.title || null,
                status: formData.status || "draft",
                platform: formData.platform || "linkedin",
                scheduledAt: formData.scheduledAt || null,
                publishedAt: formData.publishedAt || null,
                source: formData.source || null,
                isArchived: formData.isArchived || false,
            } as NewPublication);
            setFormData({
                title: null,
                content: "",
                status: "draft",
                platform: "linkedin",
                scheduledAt: null,
                publishedAt: null,
                source: null,
                isArchived: false,
            });
            setIsCreating(false);
        } catch (err) {
            console.error("Failed to create:", err);
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Publication>) => {
        try {
            await onUpdate(id, updates);
            setEditingId(null);
        } catch (err) {
            console.error("Failed to update:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this publication? This action cannot be undone.")) {
            try {
                await onDelete(id);
            } catch (err) {
                console.error("Failed to delete:", err);
            }
        }
    };

    const handleScheduleWithLate = async (publication: Publication) => {
        // Validate content exists and is not empty
        const content = publication.content?.trim();
        if (!content || content.length === 0) {
            alert("La publicación debe tener contenido para poder agendarla");
            return;
        }

        // Get date and time from publication-specific inputs or use scheduledAt if available
        const inputs = scheduleInputs[publication.id];
        let scheduleDate: Date;

        if (inputs?.date && inputs?.time) {
            scheduleDate = new Date(`${inputs.date}T${inputs.time}`);
        } else if (publication.scheduledAt) {
            scheduleDate = new Date(publication.scheduledAt);
        } else {
            // Show inputs if not already shown
            setShowScheduleInputs((prev) => new Set(prev).add(publication.id));
            return;
        }

        if (isNaN(scheduleDate.getTime())) {
            alert("Fecha o hora inválida");
            return;
        }

        // Check if date is in the future
        if (scheduleDate <= new Date()) {
            alert("La fecha de agendamiento debe ser en el futuro");
            return;
        }

        setSchedulingId(publication.id);

        try {
            const result = await schedulePublication(
                publication.id,
                content, // Use trimmed content
                scheduleDate.toISOString()
            );

            // Update the publication with the new status and late post ID
            await onUpdate(publication.id, {
                status: "scheduled",
                scheduledAt: scheduleDate,
                latePostId: result.latePost.id,
            });

            // Reset schedule inputs for this publication
            setScheduleInputs((prev) => {
                const newInputs = { ...prev };
                delete newInputs[publication.id];
                return newInputs;
            });
            setShowScheduleInputs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(publication.id);
                return newSet;
            });
            alert("¡Publicación agendada exitosamente en Late.dev!");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error desconocido";
            console.error("Error scheduling publication:", err);
            alert(`Error al agendar publicación: ${errorMessage}`);
        } finally {
            setSchedulingId(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedPublications((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const shouldShowViewMore = (content: string) => {
        // Show "View more" if content is longer than ~150 characters (approximately 3 lines)
        return content.length > 150;
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-end">
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    disabled={!selectedPersonId}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    title={!selectedPersonId ? "Please select a person first" : ""}
                >
                    {isCreating ? "Cancel" : "+ Add New Publication"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Create New Publication
                    </h2>
                    {!selectedPersonId && (
                        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                            <strong>⚠️ Warning:</strong> Please select a person from the header before creating a publication.
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value || null })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Optional title for the publication"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={6}
                                placeholder="Enter the publication content..."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Status *
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value as "draft" | "scheduled" | "published" })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Platform *
                                </label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) =>
                                        setFormData({ ...formData, platform: e.target.value as "linkedin" })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="linkedin">LinkedIn</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Source (optional)
                            </label>
                            <input
                                type="url"
                                value={formData.source || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, source: e.target.value || null })
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Schedule Date (optional)
                                </label>
                                <input
                                    type="date"
                                    value={scheduleDateTime.date}
                                    onChange={(e) =>
                                        setScheduleDateTime({ ...scheduleDateTime, date: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Schedule Time (optional)
                                </label>
                                <input
                                    type="time"
                                    value={scheduleDateTime.time}
                                    onChange={(e) =>
                                        setScheduleDateTime({ ...scheduleDateTime, time: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        {lateError && (
                            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                                <strong>Error:</strong> {lateError}
                            </div>
                        )}
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
                                    setFormData({
                                        title: null,
                                        content: "",
                                        status: "draft",
                                        platform: "linkedin",
                                        scheduledAt: null,
                                        publishedAt: null,
                                        source: null,
                                        isArchived: false,
                                    });
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
                {publications.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            No publications found. Create one to get started!
                        </p>
                    </div>
                ) : (
                    publications.map((publication) => (
                        <div
                            key={publication.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${publication.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            {editingId === publication.id ? (
                                <EditForm
                                    publication={publication}
                                    onSave={(updates) => handleUpdate(publication.id, updates)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {publication.title || "Untitled Publication"}
                                                </h3>
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${publication.status === "published"
                                                    ? "bg-green-100 text-green-700"
                                                    : publication.status === "scheduled"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {publication.status}
                                                </span>
                                                {publication.isArchived && (
                                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mb-2">
                                                <p className={`text-gray-600 whitespace-pre-wrap ${expandedPublications.has(publication.id) ? "" : "line-clamp-3"}`}>
                                                    {publication.content}
                                                </p>
                                                {shouldShowViewMore(publication.content) && (
                                                    <button
                                                        onClick={() => toggleExpand(publication.id)}
                                                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
                                                    >
                                                        {expandedPublications.has(publication.id) ? "View less" : "View more"}
                                                    </button>
                                                )}
                                            </div>
                                            {publication.source && (
                                                <div className="mb-2">
                                                    <a
                                                        href={publication.source}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {publication.source}
                                                    </a>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500">
                                                Platform: {publication.platform} •
                                                Scheduled: {formatDate(publication.scheduledAt)} •
                                                Published: {formatDate(publication.publishedAt)}
                                                {publication.latePostId && (
                                                    <> • Late ID: {publication.latePostId}</>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingId(publication.id)}
                                                    className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                                                >
                                                    Edit
                                                </button>
                                                {!publication.latePostId && publication.status !== "published" && (
                                                    <button
                                                        onClick={() => {
                                                            // Always show inputs when clicking the button
                                                            setShowScheduleInputs((prev) => new Set(prev).add(publication.id));
                                                        }}
                                                        disabled={lateLoading || schedulingId === publication.id}
                                                        className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Agendar en Late
                                                    </button>
                                                )}
                                            </div>
                                            {showScheduleInputs.has(publication.id) && !publication.latePostId && (
                                                <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-4">
                                                    <div className="mb-3 text-sm font-medium text-purple-900">
                                                        Selecciona fecha y hora para agendar:
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="mb-1 block text-xs font-medium text-purple-700">
                                                                Fecha
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={scheduleInputs[publication.id]?.date || ""}
                                                                onChange={(e) =>
                                                                    setScheduleInputs((prev) => ({
                                                                        ...prev,
                                                                        [publication.id]: {
                                                                            ...prev[publication.id],
                                                                            date: e.target.value,
                                                                            time: prev[publication.id]?.time || "",
                                                                        },
                                                                    }))
                                                                }
                                                                className="w-full rounded-lg border border-purple-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                min={new Date().toISOString().split("T")[0]}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs font-medium text-purple-700">
                                                                Hora
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={scheduleInputs[publication.id]?.time || ""}
                                                                onChange={(e) =>
                                                                    setScheduleInputs((prev) => ({
                                                                        ...prev,
                                                                        [publication.id]: {
                                                                            ...prev[publication.id],
                                                                            date: prev[publication.id]?.date || "",
                                                                            time: e.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                                className="w-full rounded-lg border border-purple-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            onClick={() => handleScheduleWithLate(publication)}
                                                            disabled={lateLoading || schedulingId === publication.id || !scheduleInputs[publication.id]?.date || !scheduleInputs[publication.id]?.time}
                                                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {schedulingId === publication.id ? "Agendando..." : "Confirmar Agendamiento"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowScheduleInputs((prev) => {
                                                                    const newSet = new Set(prev);
                                                                    newSet.delete(publication.id);
                                                                    return newSet;
                                                                });
                                                                setScheduleInputs((prev) => {
                                                                    const newInputs = { ...prev };
                                                                    delete newInputs[publication.id];
                                                                    return newInputs;
                                                                });
                                                            }}
                                                            className="rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleUpdate(publication.id, {
                                                            isArchived: !publication.isArchived,
                                                        })
                                                    }
                                                    className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                                >
                                                    {publication.isArchived ? "Unarchive" : "Archive"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(publication.id)}
                                                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Created: {formatDate(publication.createdAt)} •
                                        Updated: {formatDate(publication.updatedAt)}
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
    publication,
    onSave,
    onCancel,
}: {
    publication: Publication;
    onSave: (updates: Partial<Publication>) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(publication.title || "");
    const [content, setContent] = useState(publication.content);
    const [status, setStatus] = useState<"draft" | "scheduled" | "published">(publication.status);
    const [platform, setPlatform] = useState<"linkedin">(publication.platform);
    const [source, setSource] = useState(publication.source || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            title: title || null,
            content,
            status,
            platform,
            source: source || null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Content *
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status *
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as typeof status)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Platform *
                    </label>
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as "linkedin")}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="linkedin">LinkedIn</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Source (optional)
                </label>
                <input
                    type="url"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
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

