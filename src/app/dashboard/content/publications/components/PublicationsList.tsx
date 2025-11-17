"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/Dialog";
import { useOpenAI } from "@/hooks/useOpenAI";
import type { LatePost } from "../../../../../../services/late/posts";

function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
        return "Invalid date";
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getStatusBadgeColor(status: string) {
    switch (status) {
        case "published":
            return "bg-green-100 text-green-800";
        case "scheduled":
            return "bg-blue-100 text-blue-800";
        case "draft":
            return "bg-gray-100 text-gray-800";
        case "failed":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

interface PostCardProps {
    post: LatePost;
    onUpdate: (postId: string, updates: { title?: string; content?: string }) => Promise<void>;
    onSchedule: (postId: string, scheduleData: { scheduledFor: string; timezone: string }) => Promise<void>;
    onDelete: (postId: string) => Promise<void>;
    onAddToQueue: (postId: string) => Promise<void>;
}

function PostCard({ post, onUpdate, onSchedule, onDelete, onAddToQueue }: PostCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(post.title || "");
    const [editedContent, setEditedContent] = useState(post.content);
    const [isSaving, setIsSaving] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [isScheduling, setIsScheduling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isAddingToQueue, setIsAddingToQueue] = useState(false);
    const [mobileTab, setMobileTab] = useState<"content" | "ai">("content");

    // AI Chat states
    const [aiGeneratedText, setAiGeneratedText] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState("");
    const { improveText: improveTextWithAI, loading: aiLoading } = useOpenAI();

    // Update edited values when post changes or dialog opens
    const handleOpenChange = (open: boolean) => {
        setIsEditing(open);
        if (open) {
            setEditedTitle(post.title || "");
            setEditedContent(post.content);
            setAiGeneratedText(null);
            setChatInput("");
            setMobileTab("content");
        }
    };

    const handleAcceptAIText = () => {
        if (aiGeneratedText) {
            setEditedContent(aiGeneratedText);
            setAiGeneratedText(null);
        }
    };

    const handleSendChatMessage = async () => {
        if (!chatInput.trim() || aiLoading) return;

        const userInstruction = chatInput.trim();
        setChatInput("");

        try {
            const improvedText = await improveTextWithAI({
                currentText: editedContent,
                userInstruction,
            });
            setAiGeneratedText(improvedText);
        } catch (error) {
            alert(`Failed to improve text: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    };

    const CONTENT_PREVIEW_LENGTH = 300;
    const shouldTruncate = post.content.length > CONTENT_PREVIEW_LENGTH;
    const displayContent = isExpanded || !shouldTruncate
        ? post.content
        : `${post.content.substring(0, CONTENT_PREVIEW_LENGTH)}...`;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(post._id, {
                title: editedTitle || undefined,
                content: editedContent,
            });
            setIsEditing(false);
        } catch (error) {
            alert(`Failed to update post: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSchedule = async () => {
        if (!scheduleDate || !scheduleTime) {
            alert("Please select both date and time");
            return;
        }

        setIsScheduling(true);
        try {
            // Combine date and time and convert to ISO 8601 format with Z (UTC)
            const dateTimeString = `${scheduleDate}T${scheduleTime}`;
            const scheduleDateTime = new Date(dateTimeString);

            // Convert to UTC ISO 8601 format (with Z)
            const scheduledFor = scheduleDateTime.toISOString();

            await onSchedule(post._id, {
                scheduledFor,
                timezone: "America/Chicago", // CST timezone
            });

            setShowScheduleForm(false);
            setScheduleDate("");
            setScheduleTime("");
        } catch (error) {
            alert(`Failed to schedule post: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                    {post.title && (
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            {post.title}
                        </h3>
                    )}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(post.status)}`}
                        >
                            {post.status}
                        </span>
                    </div>
                    {post.scheduledFor && (
                        <div className="space-y-1 text-xs text-gray-500">
                            <p>
                                <span className="font-medium">Scheduled:</span> {formatDate(post.scheduledFor)}
                                {post.timezone && ` (${post.timezone})`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">
                    {displayContent}
                </p>
                {shouldTruncate && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        {isExpanded ? "View less" : "View more"}
                    </button>
                )}
            </div>

            {/* Actions */}
            {!isEditing && post.status !== "published" && (
                <div className="mt-4 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Edit
                        </button>
                        {post.status === "draft" && (
                            <button
                                onClick={async () => {
                                    setIsAddingToQueue(true);
                                    try {
                                        await onAddToQueue(post._id);
                                    } catch (error) {
                                        alert(`Failed to add post to queue: ${error instanceof Error ? error.message : "Unknown error"}`);
                                    } finally {
                                        setIsAddingToQueue(false);
                                    }
                                }}
                                disabled={isAddingToQueue}
                                className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isAddingToQueue ? "Adding..." : "Add to Queue"}
                            </button>
                        )}
                        <button
                            onClick={() => setShowScheduleForm(!showScheduleForm)}
                            disabled={post.status === "published"}
                            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {showScheduleForm ? "Cancel Schedule" : "Schedule"}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Delete
                        </button>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="mb-3 text-sm font-medium text-red-800">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    onClick={async () => {
                                        setIsDeleting(true);
                                        try {
                                            await onDelete(post._id);
                                            setShowDeleteConfirm(false);
                                        } catch (error) {
                                            alert(`Failed to delete post: ${error instanceof Error ? error.message : "Unknown error"}`);
                                        } finally {
                                            setIsDeleting(false);
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Schedule Form */}
                    {showScheduleForm && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h4 className="mb-3 text-sm font-semibold text-gray-900">Schedule Publication</h4>

                            {/* Date and Time */}
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSchedule}
                                disabled={!scheduleDate || !scheduleTime || isScheduling}
                                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isScheduling ? "Scheduling..." : "Confirm Schedule"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Tags and Hashtags */}
            {(post.tags.length > 0 || post.hashtags.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {post.hashtags.map((hashtag, idx) => (
                        <span
                            key={idx}
                            className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                            #{hashtag}
                        </span>
                    ))}
                    {post.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={handleOpenChange}>
                <DialogContent
                    className="w-[95vw]! h-[95vh]! max-w-[95vw]! max-h-[95vh]! p-0! gap-0! flex flex-col sm:flex-row top-[50%]! left-[50%]! translate-x-[-50%]! translate-y-[-50%]! rounded-lg border shadow-lg overflow-hidden"
                    showCloseButton={false}
                >
                    {/* Mobile Tabs */}
                    <div className="sm:hidden border-b border-gray-200 bg-white flex shrink-0">
                        <button
                            onClick={() => setMobileTab("content")}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mobileTab === "content"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            Content
                        </button>
                        <button
                            onClick={() => setMobileTab("ai")}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mobileTab === "ai"
                                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            AI Assistant
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className={`${mobileTab === "content" ? "flex" : "hidden"} sm:flex w-full sm:w-2/3 overflow-hidden flex-col h-full`}>
                        {/* Form Row */}
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-6">
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Post title (optional)"
                                />
                            </div>
                            <div className="flex-1 flex flex-col min-h-0">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Content
                                </label>
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="flex-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none whitespace-pre-wrap"
                                    placeholder="Post content"
                                />
                            </div>
                        </div>
                        {/* Buttons Row */}
                        <div className="border-t border-gray-200 flex items-center justify-end gap-3 px-6 py-4 shrink-0">
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>

                    {/* AI Panel */}
                    <div className={`${mobileTab === "ai" ? "flex" : "hidden"} sm:flex w-full sm:w-1/3 sm:border-l border-gray-200 flex flex-col bg-gray-50 h-full`}>
                        <div className="p-4 border-b border-gray-200 bg-white shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                            <p className="text-xs text-gray-500 mt-1">Improve your publication with AI</p>
                        </div>

                        {/* Generated Text */}
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            {aiLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                </div>
                            ) : aiGeneratedText ? (
                                <>
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
                                        <label className="text-sm font-medium text-gray-700">Generated Text</label>
                                        <button
                                            onClick={handleAcceptAIText}
                                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{aiGeneratedText}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-8">
                                    <p>Ask AI to improve, rewrite, or enhance your publication</p>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="border-t border-gray-200 bg-white p-4 shrink-0 flex items-center">
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendChatMessage();
                                        }
                                    }}
                                    disabled={aiLoading}
                                    placeholder="Ask AI to improve the text..."
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSendChatMessage}
                                    disabled={!chatInput.trim() || aiLoading}
                                    className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {aiLoading ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface PublicationsListProps {
    posts: LatePost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    currentPage: number;
    onPageChange: (page: number) => void;
    onUpdate: (postId: string, updates: { title?: string; content?: string }) => Promise<void>;
    onSchedule: (postId: string, scheduleData: { scheduledFor: string; timezone: string }) => Promise<void>;
    onDelete: (postId: string) => Promise<void>;
    onAddToQueue: (postId: string) => Promise<void>;
    loading: boolean;
}

export function PublicationsList({
    posts,
    pagination,
    currentPage,
    onPageChange,
    onUpdate,
    onSchedule,
    onDelete,
    onAddToQueue,
    loading,
}: PublicationsListProps) {
    return (
        <>
            {/* Posts List */}
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p className="text-gray-500">No publications found</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onUpdate={onUpdate}
                            onSchedule={onSchedule}
                            onDelete={onDelete}
                            onAddToQueue={onAddToQueue}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages || loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </>
    );
}

