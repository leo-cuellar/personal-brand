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

export function PublicationsPage() {
    const { getPosts, loading, error } = useLate();
    const [posts, setPosts] = useState<LatePost[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [statusFilter, setStatusFilter] = useState<"draft" | "scheduled" | "published" | "failed" | "all">("all");
    const [platformFilter, setPlatformFilter] = useState<string>("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [includeHidden, setIncludeHidden] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);

    // Get profileId from environment (LATE_PROFILE_ID)
    // For now, we'll use it as a filter if needed
    const profileId = process.env.NEXT_PUBLIC_LATE_PROFILE_ID || "";

    useEffect(() => {
        let cancelled = false;

        const fetchPosts = async () => {
            try {
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
                if (profileId) {
                    params.profileId = profileId;
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
    }, [getPosts, currentPage, limit, statusFilter, platformFilter, dateFrom, dateTo, includeHidden, profileId]);

    const getStatusBadgeColor = (status: string) => {
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
    };

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
                        <div
                            key={post.id}
                            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(post.status)}`}
                                        >
                                            {post.status}
                                        </span>
                                        {post.platforms.map((platform, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                                            >
                                                {platform.platform} ({platform.status})
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mb-2 text-sm text-gray-500">
                                        ID: {post.id}
                                    </p>
                                    {post.scheduledFor && (
                                        <p className="mb-1 text-sm text-gray-500">
                                            Scheduled: {formatDate(post.scheduledFor)}
                                        </p>
                                    )}
                                    {post.publishedAt && (
                                        <p className="mb-1 text-sm text-gray-500">
                                            Published: {formatDate(post.publishedAt)}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Created: {formatDate(post.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="whitespace-pre-wrap text-sm text-gray-900">
                                    {post.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages || loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

