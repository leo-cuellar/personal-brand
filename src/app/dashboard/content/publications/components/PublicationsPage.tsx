"use client";

import { useState, useEffect } from "react";
import { useLate } from "@/hooks/useLate";
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

export function PublicationsPage() {
    const { getPosts, updatePost: updatePostHook, schedulePost: schedulePostHook, loading, error } = useLate();
    const [posts, setPosts] = useState<LatePost[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });

    // Filters
    const [statusFilter, setStatusFilter] = useState<"draft" | "scheduled" | "published" | "failed" | "all">("all");
    const [platformFilter, setPlatformFilter] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [includeHidden, setIncludeHidden] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    useEffect(() => {
        let cancelled = false;

        const fetchPosts = async () => {
            try {
                const params: {
                    page?: number;
                    limit?: number;
                    status?: "draft" | "scheduled" | "published" | "failed";
                    platform?: string;
                    dateFrom?: string;
                    dateTo?: string;
                    includeHidden?: boolean;
                } = {
                    page: currentPage,
                    limit: limit,
                    includeHidden: includeHidden,
                };

                if (statusFilter !== "all") {
                    params.status = statusFilter;
                }
                if (platformFilter) {
                    params.platform = platformFilter;
                }
                if (dateFrom) {
                    // Convert date input to ISO datetime (start of day)
                    const fromDate = new Date(dateFrom);
                    fromDate.setHours(0, 0, 0, 0);
                    params.dateFrom = fromDate.toISOString();
                }
                if (dateTo) {
                    // Convert date input to ISO datetime (end of day)
                    const toDate = new Date(dateTo);
                    toDate.setHours(23, 59, 59, 999);
                    params.dateTo = toDate.toISOString();
                }

                const response = await getPosts(params);

                if (!cancelled) {
                    setPosts(response.posts);
                    setPagination(response.pagination);
                }
            } catch {
                // Error is handled by the hook
            }
        };

        fetchPosts();

        return () => {
            cancelled = true;
        };
    }, [getPosts, currentPage, limit, statusFilter, platformFilter, dateFrom, dateTo, includeHidden]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-lg text-gray-600">Loading publications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-8">
            <div className="mb-8">
                <h1 className="mb-2 text-4xl font-bold text-gray-900">Publications</h1>
                <p className="text-gray-600">
                    Manage your publications from Late.dev
                </p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800">Error: {error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as typeof statusFilter);
                                setCurrentPage(1); // Reset to first page on filter change
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Platform
                        </label>
                        <input
                            type="text"
                            value={platformFilter}
                            onChange={(e) => {
                                setPlatformFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="e.g., linkedin"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Date From
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Date To
                        </label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => {
                                setDateTo(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={includeHidden}
                            onChange={(e) => {
                                setIncludeHidden(e.target.checked);
                                setCurrentPage(1);
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Include Hidden</span>
                    </label>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <span>Limit:</span>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </label>
                        <span className="text-sm text-gray-500">
                            {pagination.total} publication{pagination.total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>

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
                            onUpdate={async (postId, updates) => {
                                await updatePostHook(postId, updates);
                                // Refetch posts after update
                                const params: {
                                    page?: number;
                                    limit?: number;
                                    status?: "draft" | "scheduled" | "published" | "failed";
                                    platform?: string;
                                    profileId?: string;
                                    dateFrom?: string;
                                    dateTo?: string;
                                    includeHidden?: boolean;
                                } = {
                                    page: currentPage,
                                    limit: limit,
                                    includeHidden: includeHidden,
                                };
                                if (statusFilter !== "all") {
                                    params.status = statusFilter;
                                }
                                if (platformFilter) {
                                    params.platform = platformFilter;
                                }
                                if (dateFrom) {
                                    const fromDate = new Date(dateFrom);
                                    fromDate.setHours(0, 0, 0, 0);
                                    params.dateFrom = fromDate.toISOString();
                                }
                                if (dateTo) {
                                    const toDate = new Date(dateTo);
                                    toDate.setHours(23, 59, 59, 999);
                                    params.dateTo = toDate.toISOString();
                                }
                                const response = await getPosts(params);
                                setPosts(response.posts);
                                setPagination(response.pagination);
                            }}
                            onSchedule={async (postId, scheduleData) => {
                                await schedulePostHook(postId, scheduleData);
                                // Refetch posts after schedule
                                const params: {
                                    page?: number;
                                    limit?: number;
                                    status?: "draft" | "scheduled" | "published" | "failed";
                                    platform?: string;
                                    dateFrom?: string;
                                    dateTo?: string;
                                    includeHidden?: boolean;
                                } = {
                                    page: currentPage,
                                    limit: limit,
                                    includeHidden: includeHidden,
                                };
                                if (statusFilter !== "all") {
                                    params.status = statusFilter;
                                }
                                if (platformFilter) {
                                    params.platform = platformFilter;
                                }
                                if (dateFrom) {
                                    const fromDate = new Date(dateFrom);
                                    fromDate.setHours(0, 0, 0, 0);
                                    params.dateFrom = fromDate.toISOString();
                                }
                                if (dateTo) {
                                    const toDate = new Date(dateTo);
                                    toDate.setHours(23, 59, 59, 999);
                                    params.dateTo = toDate.toISOString();
                                }
                                const response = await getPosts(params);
                                setPosts(response.posts);
                                setPagination(response.pagination);
                            }}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages || loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

