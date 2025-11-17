"use client";

import { useState, useEffect, useMemo } from "react";
import { useLate } from "@/hooks/useLate";
import { PublicationsContainer } from "./PublicationsContainer";
import type { LatePost } from "../../../../../../services/late/posts";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function PublicationsPage() {
    const { getPosts, updatePost: updatePostHook, schedulePost: schedulePostHook, deletePost: deletePostHook, addPostToQueue: addPostToQueueHook, loading, error } = useLate();

    // Calculate default calendar date range (current month)
    const defaultCalendarDateFrom = useMemo(() => {
        return format(startOfMonth(new Date()), "yyyy-MM-dd");
    }, []);

    const defaultCalendarDateTo = useMemo(() => {
        return format(endOfMonth(new Date()), "yyyy-MM-dd");
    }, []);

    const [calendarDateFrom, setCalendarDateFrom] = useState(defaultCalendarDateFrom);
    const [calendarDateTo, setCalendarDateTo] = useState(defaultCalendarDateTo);
    const [posts, setPosts] = useState<LatePost[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });

    // Filters
    const [statusFilter, setStatusFilter] = useState<"draft" | "scheduled" | "published" | "failed" | "all">("all");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [includeHidden, setIncludeHidden] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

    // When calendar date range changes, update the main date filters
    const handleCalendarDateFromChange = (date: string) => {
        setCalendarDateFrom(date);
        if (viewMode === "calendar") {
            setDateFrom(date);
            setCurrentPage(1);
        }
    };

    const handleCalendarDateToChange = (date: string) => {
        setCalendarDateTo(date);
        if (viewMode === "calendar") {
            setDateTo(date);
            setCurrentPage(1);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchPosts = async () => {
            try {
                const params: {
                    page?: number;
                    limit?: number;
                    status?: "draft" | "scheduled" | "published" | "failed";
                    dateFrom?: string;
                    dateTo?: string;
                    includeHidden?: boolean;
                } = {
                    page: viewMode === "list" ? currentPage : 1, // Calendar doesn't use pagination
                    limit: viewMode === "list" ? limit : 100, // Get more posts for calendar view
                    includeHidden: includeHidden,
                };

                // For calendar view, only show posts with scheduledFor and use calendar date range
                if (viewMode === "calendar") {
                    params.dateFrom = calendarDateFrom ? (() => {
                        const fromDate = new Date(calendarDateFrom);
                        fromDate.setHours(0, 0, 0, 0);
                        return fromDate.toISOString();
                    })() : undefined;
                    params.dateTo = calendarDateTo ? (() => {
                        const toDate = new Date(calendarDateTo);
                        toDate.setHours(23, 59, 59, 999);
                        return toDate.toISOString();
                    })() : undefined;
                } else {
                    // For list view, use regular filters
                    if (statusFilter !== "all") {
                        params.status = statusFilter;
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
                }

                const response = await getPosts(params);

                if (!cancelled) {
                    // For calendar, filter to only posts with scheduledFor
                    const filteredPosts = viewMode === "calendar"
                        ? response.posts.filter((post) => post.scheduledFor)
                        : response.posts;
                    setPosts(filteredPosts);
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
    }, [getPosts, currentPage, limit, statusFilter, dateFrom, dateTo, includeHidden, viewMode, calendarDateFrom, calendarDateTo]);

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

            {/* Publications Container (List or Calendar) */}
            <PublicationsContainer
                posts={posts}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onUpdate={async (postId, updates) => {
                    await updatePostHook(postId, updates);
                    // Refetch posts after update
                    const params: {
                        page?: number;
                        limit?: number;
                        status?: "draft" | "scheduled" | "published" | "failed";
                        dateFrom?: string;
                        dateTo?: string;
                        includeHidden?: boolean;
                    } = {
                        page: viewMode === "list" ? currentPage : 1,
                        limit: viewMode === "list" ? limit : 100,
                        includeHidden: includeHidden,
                    };
                    if (viewMode === "calendar") {
                        if (calendarDateFrom) {
                            const fromDate = new Date(calendarDateFrom);
                            fromDate.setHours(0, 0, 0, 0);
                            params.dateFrom = fromDate.toISOString();
                        }
                        if (calendarDateTo) {
                            const toDate = new Date(calendarDateTo);
                            toDate.setHours(23, 59, 59, 999);
                            params.dateTo = toDate.toISOString();
                        }
                    } else {
                        if (statusFilter !== "all") {
                            params.status = statusFilter;
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
                    }
                    const response = await getPosts(params);
                    const filteredPosts = viewMode === "calendar"
                        ? response.posts.filter((post) => post.scheduledFor)
                        : response.posts;
                    setPosts(filteredPosts);
                    setPagination(response.pagination);
                }}
                onSchedule={async (postId, scheduleData) => {
                    await schedulePostHook(postId, scheduleData);
                    // Refetch posts after schedule
                    const params: {
                        page?: number;
                        limit?: number;
                        status?: "draft" | "scheduled" | "published" | "failed";
                        dateFrom?: string;
                        dateTo?: string;
                        includeHidden?: boolean;
                    } = {
                        page: viewMode === "list" ? currentPage : 1,
                        limit: viewMode === "list" ? limit : 100,
                        includeHidden: includeHidden,
                    };
                    if (viewMode === "calendar") {
                        if (calendarDateFrom) {
                            const fromDate = new Date(calendarDateFrom);
                            fromDate.setHours(0, 0, 0, 0);
                            params.dateFrom = fromDate.toISOString();
                        }
                        if (calendarDateTo) {
                            const toDate = new Date(calendarDateTo);
                            toDate.setHours(23, 59, 59, 999);
                            params.dateTo = toDate.toISOString();
                        }
                    } else {
                        if (statusFilter !== "all") {
                            params.status = statusFilter;
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
                    }
                    const response = await getPosts(params);
                    const filteredPosts = viewMode === "calendar"
                        ? response.posts.filter((post) => post.scheduledFor)
                        : response.posts;
                    setPosts(filteredPosts);
                    setPagination(response.pagination);
                }}
                onDelete={async (postId) => {
                    await deletePostHook(postId);
                    // Refetch posts after delete
                    const params: {
                        page?: number;
                        limit?: number;
                        status?: "draft" | "scheduled" | "published" | "failed";
                        dateFrom?: string;
                        dateTo?: string;
                        includeHidden?: boolean;
                    } = {
                        page: viewMode === "list" ? currentPage : 1,
                        limit: viewMode === "list" ? limit : 100,
                        includeHidden: includeHidden,
                    };
                    if (viewMode === "calendar") {
                        if (calendarDateFrom) {
                            const fromDate = new Date(calendarDateFrom);
                            fromDate.setHours(0, 0, 0, 0);
                            params.dateFrom = fromDate.toISOString();
                        }
                        if (calendarDateTo) {
                            const toDate = new Date(calendarDateTo);
                            toDate.setHours(23, 59, 59, 999);
                            params.dateTo = toDate.toISOString();
                        }
                    } else {
                        if (statusFilter !== "all") {
                            params.status = statusFilter;
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
                    }
                    const response = await getPosts(params);
                    const filteredPosts = viewMode === "calendar"
                        ? response.posts.filter((post) => post.scheduledFor)
                        : response.posts;
                    setPosts(filteredPosts);
                    setPagination(response.pagination);
                }}
                onAddToQueue={async (postId) => {
                    await addPostToQueueHook(postId);
                    // Refetch posts after adding to queue
                    const params: {
                        page?: number;
                        limit?: number;
                        status?: "draft" | "scheduled" | "published" | "failed";
                        dateFrom?: string;
                        dateTo?: string;
                        includeHidden?: boolean;
                    } = {
                        page: viewMode === "list" ? currentPage : 1,
                        limit: viewMode === "list" ? limit : 100,
                        includeHidden: includeHidden,
                    };
                    if (viewMode === "calendar") {
                        if (calendarDateFrom) {
                            const fromDate = new Date(calendarDateFrom);
                            fromDate.setHours(0, 0, 0, 0);
                            params.dateFrom = fromDate.toISOString();
                        }
                        if (calendarDateTo) {
                            const toDate = new Date(calendarDateTo);
                            toDate.setHours(23, 59, 59, 999);
                            params.dateTo = toDate.toISOString();
                        }
                    } else {
                        if (statusFilter !== "all") {
                            params.status = statusFilter;
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
                    }
                    const response = await getPosts(params);
                    const filteredPosts = viewMode === "calendar"
                        ? response.posts.filter((post) => post.scheduledFor)
                        : response.posts;
                    setPosts(filteredPosts);
                    setPagination(response.pagination);
                }}
                loading={loading}
                calendarDateFrom={calendarDateFrom}
                calendarDateTo={calendarDateTo}
                onCalendarDateFromChange={handleCalendarDateFromChange}
                onCalendarDateToChange={handleCalendarDateToChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />
        </div>
    );
}

