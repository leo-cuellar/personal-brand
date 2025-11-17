"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { usePublicationIdeas } from "@/hooks/usePublicationIdeas";
import { usePersonalBrandContext } from "@/contexts/PersonalBrandContext";
import { IdeasReviewFlow } from "./IdeasReviewFlow";
import { Icon } from "@/components/Icon";
import type { PublicationIdea } from "../../../../../../services/supabase/schemas";

export function PublicationIdeasPage() {
    const [activeTab, setActiveTab] = useState<"ready-for-review" | "accepted">("ready-for-review");
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        link: "",
    });
    // Local state for each tab to avoid refetching
    const [readyForReviewIdeas, setReadyForReviewIdeas] = useState<PublicationIdea[]>([]);
    const [acceptedIdeas, setAcceptedIdeas] = useState<PublicationIdea[]>([]);
    const [hasFetchedReadyForReview, setHasFetchedReadyForReview] = useState(false);
    const [hasFetchedAccepted, setHasFetchedAccepted] = useState(false);

    const { selectedPersonId } = usePersonalBrandContext();
    const { loading, error, update, create, counts, getPublicationIdeas, getCounts } = usePublicationIdeas();
    const { publicationIdeas: reviewIdeas, getPublicationIdeas: getReviewIdeas } = usePublicationIdeas();

    // Current ideas based on active tab
    const publicationIdeas = activeTab === "ready-for-review" ? readyForReviewIdeas : acceptedIdeas;

    const reviewParams = useMemo(() => {
        if (!selectedPersonId) return undefined;
        return { status: "in_review" as const, includeArchived: false, personalBrandId: selectedPersonId };
    }, [selectedPersonId]);

    const reviewParamsRef = useRef<string | null>(null);

    // Helper to fetch ideas for a specific tab
    const fetchIdeasForTab = useCallback(async (tab: "ready-for-review" | "accepted") => {
        if (!selectedPersonId) return;
        const tabParams = {
            personalBrandId: selectedPersonId,
            status: (tab === "ready-for-review" ? "in_review" : "accepted") as "in_review" | "accepted",
        };
        try {
            const ideas = await getPublicationIdeas(tabParams);
            if (tab === "ready-for-review") {
                setReadyForReviewIdeas(ideas);
                setHasFetchedReadyForReview(true);
            } else {
                setAcceptedIdeas(ideas);
                setHasFetchedAccepted(true);
            }
        } catch {
            // Error handled by UI
        }
    }, [selectedPersonId, getPublicationIdeas]);

    // Fetch counts on mount and when personal brand changes
    useEffect(() => {
        getCounts();
    }, [getCounts]);

    // Fetch ideas for active tab only if not already fetched
    useEffect(() => {
        if (!selectedPersonId) return;
        if (activeTab === "ready-for-review" && hasFetchedReadyForReview) return;
        if (activeTab === "accepted" && hasFetchedAccepted) return;

        let cancelled = false;
        const loadIdeas = async () => {
            const tabParams = {
                personalBrandId: selectedPersonId,
                status: (activeTab === "ready-for-review" ? "in_review" : "accepted") as "in_review" | "accepted",
            };
            try {
                const ideas = await getPublicationIdeas(tabParams);
                if (!cancelled) {
                    if (activeTab === "ready-for-review") {
                        setReadyForReviewIdeas(ideas);
                        setHasFetchedReadyForReview(true);
                    } else {
                        setAcceptedIdeas(ideas);
                        setHasFetchedAccepted(true);
                    }
                }
            } catch {
                // Error handled by UI
            }
        };

        loadIdeas();

        return () => {
            cancelled = true;
        };
    }, [activeTab, hasFetchedReadyForReview, hasFetchedAccepted, getPublicationIdeas, selectedPersonId]);

    useEffect(() => {
        if (!reviewParams) return;
        const reviewParamsKey = JSON.stringify(reviewParams);
        if (reviewParamsRef.current === reviewParamsKey) return;
        reviewParamsRef.current = reviewParamsKey;
        getReviewIdeas(reviewParams);
    }, [reviewParams, getReviewIdeas]);

    const handleAccept = async (id: string) => {
        try {
            await update(id, { status: "accepted" });
            // Update local state optimistically
            setReadyForReviewIdeas((prev) => prev.filter((idea) => idea.id !== id));
            // Refresh counts
            await getCounts();
            // Refresh accepted tab if we have it cached
            if (hasFetchedAccepted) {
                await fetchIdeasForTab("accepted");
            }
            // Refresh review list
            if (reviewParams) {
                await getReviewIdeas(reviewParams);
            }
        } catch {
            // Error handled by UI
        }
    };

    const handleReject = async (id: string) => {
        try {
            await update(id, { status: "rejected" });
            // Update local state optimistically
            setReadyForReviewIdeas((prev) => prev.filter((idea) => idea.id !== id));
            // Refresh counts
            await getCounts();
            // Refresh review list if we're on ready-for-review tab
            if (activeTab === "ready-for-review" && reviewParams) {
                await getReviewIdeas(reviewParams);
            }
        } catch {
            // Error handled by UI
        }
    };

    const handleStartReview = () => {
        if (reviewIdeas.length === 0) {
            alert("No ideas in review to process.");
            return;
        }
        setIsReviewMode(true);
    };

    const handleExitReview = () => {
        setIsReviewMode(false);
        // Refresh the current tab when exiting review mode
        if (activeTab === "ready-for-review") {
            fetchIdeasForTab("ready-for-review");
        } else {
            fetchIdeasForTab("accepted");
        }
        getCounts();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPersonId) {
            alert("Please select a person first from the header");
            return;
        }
        if (!formData.title.trim()) {
            alert("Title is required");
            return;
        }
        try {
            const newIdea = await create({
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                link: formData.link.trim() || null,
                status: "accepted",
                isArchived: false,
                personalBrandId: selectedPersonId!,
            });
            setFormData({ title: "", description: "", link: "" });
            setIsCreating(false);
            // Update local state optimistically
            setAcceptedIdeas((prev) => [newIdea, ...prev]);
            // Refresh counts
            await getCounts();
            // If we're on accepted tab, ensure it's marked as fetched
            if (activeTab === "accepted") {
                setHasFetchedAccepted(true);
            }
        } catch {
            // Error handled by UI
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "accepted":
                return "bg-green-100 text-green-700";
            case "rejected":
                return "bg-red-100 text-red-700";
            case "in_review":
                return "bg-yellow-100 text-yellow-700";
            case "used":
                return "bg-blue-100 text-blue-700";
            case "incomplete":
                return "bg-orange-100 text-orange-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "accepted":
                return "Accepted";
            case "rejected":
                return "Rejected";
            case "in_review":
                return "In Review";
            case "used":
                return "Used";
            case "incomplete":
                return "Incomplete";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading publication ideas...</p>
                </div>
            </div>
        );
    }

    // Show review flow if in review mode
    if (isReviewMode) {
        return (
            <IdeasReviewFlow
                ideas={reviewIdeas}
                onAccept={handleAccept}
                onReject={handleReject}
                onExit={handleExitReview}
            />
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">
                    Publication Ideas
                </h1>
                <p className="text-gray-600">
                    Review and manage publication ideas
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Add New Idea button or form */}
            {!isCreating ? (
                <div className="mb-6">
                    <button
                        onClick={() => setIsCreating(true)}
                        disabled={!selectedPersonId}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        title={!selectedPersonId ? "Please select a person first" : ""}
                    >
                        <span className="text-xl">+</span>
                        Add New Idea
                    </button>
                </div>
            ) : (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                        Create New Idea
                    </h2>
                    {!selectedPersonId && (
                        <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
                            <strong>⚠️ Warning:</strong> Please select a person from the header before creating an idea.
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Hablar sobre cómo la tecnología está cambiando el trabajo"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description (optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Additional context or details about this idea..."
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Link (optional)
                            </label>
                            <input
                                type="url"
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Create Idea
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setFormData({ title: "", description: "", link: "" });
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("ready-for-review")}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === "ready-for-review"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        Ready for Review
                        {counts && counts.in_review > 0 && (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                                {counts.in_review}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("accepted")}
                        className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${activeTab === "accepted"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        Publication Queue
                        {counts && counts.accepted > 0 && (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                                {counts.accepted}
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {activeTab === "ready-for-review" && reviewIdeas.length > 0 && (
                <div className="mb-6 flex items-center justify-end">
                    <button
                        onClick={handleStartReview}
                        className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Start Review ({reviewIdeas.length})
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {publicationIdeas.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                        <p className="text-gray-500">
                            {activeTab === "ready-for-review"
                                ? "No ideas ready for review."
                                : "No ideas in publication queue."}
                        </p>
                    </div>
                ) : (
                    publicationIdeas.map((idea) => (
                        <div
                            key={idea.id}
                            className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${idea.isArchived
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-200 bg-white"
                                }`}
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {idea.title}
                                        </h3>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(idea.status)}`}>
                                            {getStatusLabel(idea.status)}
                                        </span>
                                        {idea.isArchived && (
                                            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                                                Archived
                                            </span>
                                        )}
                                    </div>
                                    {idea.description && (
                                        <p className="text-gray-600">{idea.description}</p>
                                    )}
                                    {idea.link && (
                                        <div className="mt-2">
                                            <a
                                                href={idea.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {idea.link}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {idea.sourceSummary && (
                                <div className="mt-4">
                                    <SourceSummaryCard sourceSummary={idea.sourceSummary} />
                                </div>
                            )}
                            {activeTab === "ready-for-review" && idea.status === "in_review" && (
                                <div className="mb-3 flex gap-3">
                                    <button
                                        onClick={() => handleAccept(idea.id)}
                                        className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(idea.id)}
                                        className="rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

interface SourceSummaryCardProps {
    sourceSummary: string;
}

function SourceSummaryCard({ sourceSummary }: SourceSummaryCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="w-full rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
            {/* First row: Title and Chevron */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between py-2 px-3 text-left transition-colors hover:bg-blue-100 rounded-t-lg"
            >
                <div className="text-sm font-medium text-blue-900">Source summary</div>
                <Icon
                    name={isExpanded ? "chevronUp" : "chevronDown"}
                    color="#1e40af"
                    size={14}
                />
            </button>

            {/* Collapsible content: Source summary text */}
            {isExpanded && (
                <div className="border-t border-blue-200 p-3 rounded-b-lg">
                    <div className="text-xs text-blue-700 whitespace-pre-wrap leading-relaxed">
                        {sourceSummary}
                    </div>
                </div>
            )}
        </div>
    );
}
