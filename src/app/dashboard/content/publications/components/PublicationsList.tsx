"use client";

import { useState } from "react";
import type { LatePost } from "@/services/late/posts";

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
}

function PostCard({ post, onUpdate, onSchedule }: PostCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(post.title || "");
    const [editedContent, setEditedContent] = useState(post.content);
    const [isSaving, setIsSaving] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [isScheduling, setIsScheduling] = useState(false);

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

    const handleCancel = () => {
        setEditedTitle(post.title || "");
        setEditedContent(post.content);
        setIsEditing(false);
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
                        {post.platforms && post.platforms.length > 0 && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                {post.platforms.length} platform{post.platforms.length !== 1 ? "s" : ""}
                            </span>
                        )}
                        {post.visibility && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {post.visibility}
                            </span>
                        )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                        <p>
                            <span className="font-medium">ID:</span> {post._id}
                        </p>
                        {post.userId && (
                            <p>
                                <span className="font-medium">Author:</span> {post.userId.name} ({post.userId.id})
                            </p>
                        )}
                        {post.scheduledFor && (
                            <p>
                                <span className="font-medium">Scheduled:</span> {formatDate(post.scheduledFor)}
                                {post.timezone && ` (${post.timezone})`}
                            </p>
                        )}
                        <p>
                            <span className="font-medium">Created:</span> {formatDate(post.createdAt)}
                        </p>
                        <p>
                            <span className="font-medium">Updated:</span> {formatDate(post.updatedAt)}
                        </p>
                        {post.analytics && (
                            <div className="mt-2 flex flex-wrap gap-3">
                                <span>
                                    <span className="font-medium">Impressions:</span> {post.analytics.impressions}
                                </span>
                                <span>
                                    <span className="font-medium">Likes:</span> {post.analytics.likes}
                                </span>
                                <span>
                                    <span className="font-medium">Comments:</span> {post.analytics.comments}
                                </span>
                                <span>
                                    <span className="font-medium">Shares:</span> {post.analytics.shares}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="rounded-lg bg-gray-50 p-4">
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Post title (optional)"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Content
                            </label>
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                rows={10}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Post content"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {/* Actions */}
            {!isEditing && (
                <div className="mt-4 space-y-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setShowScheduleForm(!showScheduleForm)}
                            disabled={post.status === "published"}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {showScheduleForm ? "Cancel Schedule" : "Schedule"}
                        </button>
                    </div>

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
    loading: boolean;
}

export function PublicationsList({
    posts,
    pagination,
    currentPage,
    onPageChange,
    onUpdate,
    onSchedule,
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

