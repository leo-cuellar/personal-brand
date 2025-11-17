"use client";

import { useState, useEffect, useMemo } from "react";
import { useLate } from "@/hooks/useLate";
import { PublicationsContainer } from "./PublicationsContainer";
import type { LatePost } from "../../../../../../services/late/posts";
import { startOfMonth, endOfMonth, format } from "date-fns";

type TabType = "draft" | "queue" | "sent";

interface TabState {
    posts: LatePost[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    currentPage: number;
    limit: number;
    hasFetched: boolean;
    loading: boolean;
}

export function PublicationsPage() {
    const { getPosts, updatePost: updatePostHook, schedulePost: schedulePostHook, deletePost: deletePostHook, addPostToQueue: addPostToQueueHook, loading: globalLoading, error } = useLate();

    // Calculate default calendar date range (current month)
    const defaultCalendarDateFrom = useMemo(() => {
        return format(startOfMonth(new Date()), "yyyy-MM-dd");
    }, []);

    const defaultCalendarDateTo = useMemo(() => {
        return format(endOfMonth(new Date()), "yyyy-MM-dd");
    }, []);

    const [calendarDateFrom, setCalendarDateFrom] = useState(defaultCalendarDateFrom);
    const [calendarDateTo, setCalendarDateTo] = useState(defaultCalendarDateTo);

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>("draft");
    const [tabsState, setTabsState] = useState<Record<TabType, TabState>>({
        draft: {
            posts: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 },
            currentPage: 1,
            limit: 10,
            hasFetched: false,
            loading: false,
        },
        queue: {
            posts: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 },
            currentPage: 1,
            limit: 10,
            hasFetched: false,
            loading: false,
        },
        sent: {
            posts: [],
            pagination: { page: 1, limit: 10, total: 0, pages: 0 },
            currentPage: 1,
            limit: 10,
            hasFetched: false,
            loading: false,
        },
    });

    // Filters (shared across tabs)
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [includeHidden, setIncludeHidden] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

    // When calendar date range changes, update the main date filters
    const handleCalendarDateFromChange = (date: string) => {
        setCalendarDateFrom(date);
        if (viewMode === "calendar") {
            setDateFrom(date);
            // Reset pagination for all tabs when calendar date changes
            setTabsState((prev) => ({
                ...prev,
                draft: { ...prev.draft, currentPage: 1, hasFetched: false },
                queue: { ...prev.queue, currentPage: 1, hasFetched: false },
                sent: { ...prev.sent, currentPage: 1, hasFetched: false },
            }));
        }
    };

    const handleCalendarDateToChange = (date: string) => {
        setCalendarDateTo(date);
        if (viewMode === "calendar") {
            setDateTo(date);
            // Reset pagination for all tabs when calendar date changes
            setTabsState((prev) => ({
                ...prev,
                draft: { ...prev.draft, currentPage: 1, hasFetched: false },
                queue: { ...prev.queue, currentPage: 1, hasFetched: false },
                sent: { ...prev.sent, currentPage: 1, hasFetched: false },
            }));
        }
    };

    // Fetch posts for active tab
    useEffect(() => {
        const currentTabState = tabsState[activeTab];

        // Skip if already fetched
        if (currentTabState.hasFetched) {
            return;
        }

        let cancelled = false;

        const fetchPosts = async () => {
            // Set loading state for this tab
            setTabsState((prev) => ({
                ...prev,
                [activeTab]: { ...prev[activeTab], loading: true },
            }));

            try {
                // Determine status based on active tab
                const statusMap: Record<TabType, "draft" | "scheduled" | "published"> = {
                    draft: "draft",
                    queue: "scheduled",
                    sent: "published",
                };

                const params: {
                    page?: number;
                    limit?: number;
                    status?: "draft" | "scheduled" | "published" | "failed";
                    dateFrom?: string;
                    dateTo?: string;
                    includeHidden?: boolean;
                } = {
                    page: viewMode === "list" ? currentTabState.currentPage : 1,
                    limit: viewMode === "list" ? currentTabState.limit : 100,
                    status: statusMap[activeTab],
                    includeHidden: includeHidden,
                };

                // For calendar view, use calendar date range
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

                    setTabsState((prev) => ({
                        ...prev,
                        [activeTab]: {
                            ...prev[activeTab],
                            posts: filteredPosts,
                            pagination: response.pagination,
                            hasFetched: true,
                            loading: false,
                        },
                    }));
                }
            } catch {
                // Error is handled by the hook
                setTabsState((prev) => ({
                    ...prev,
                    [activeTab]: { ...prev[activeTab], loading: false },
                }));
            }
        };

        fetchPosts();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, tabsState[activeTab].currentPage, tabsState[activeTab].limit, dateFrom, dateTo, includeHidden, viewMode, calendarDateFrom, calendarDateTo, getPosts]);

    const handlePageChange = (newPage: number) => {
        setTabsState((prev) => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], currentPage: newPage, hasFetched: false },
        }));
    };

    const handleLimitChange = (newLimit: number) => {
        setTabsState((prev) => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], limit: newLimit, currentPage: 1, hasFetched: false },
        }));
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    // Helper function to refetch current tab
    const refetchCurrentTab = async () => {
        const currentTabState = tabsState[activeTab];
        const statusMap: Record<TabType, "draft" | "scheduled" | "published"> = {
            draft: "draft",
            queue: "scheduled",
            sent: "published",
        };

        const params: {
            page?: number;
            limit?: number;
            status?: "draft" | "scheduled" | "published" | "failed";
            dateFrom?: string;
            dateTo?: string;
            includeHidden?: boolean;
        } = {
            page: viewMode === "list" ? currentTabState.currentPage : 1,
            limit: viewMode === "list" ? currentTabState.limit : 100,
            status: statusMap[activeTab],
            includeHidden: includeHidden,
        };

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

        setTabsState((prev) => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                posts: filteredPosts,
                pagination: response.pagination,
            },
        }));
    };

    const currentTabState = tabsState[activeTab];
    const isLoading = currentTabState.loading || globalLoading;

    if (isLoading && currentTabState.posts.length === 0 && !currentTabState.hasFetched) {
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

            {/* Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => handleTabChange("draft")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "draft"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    Draft
                </button>
                <button
                    onClick={() => handleTabChange("queue")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "queue"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    Queue
                </button>
                <button
                    onClick={() => handleTabChange("sent")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "sent"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    Sent
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Date From
                        </label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => {
                                setDateFrom(e.target.value);
                                setTabsState((prev) => ({
                                    ...prev,
                                    [activeTab]: { ...prev[activeTab], currentPage: 1, hasFetched: false },
                                }));
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
                                setTabsState((prev) => ({
                                    ...prev,
                                    [activeTab]: { ...prev[activeTab], currentPage: 1, hasFetched: false },
                                }));
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={includeHidden}
                                onChange={(e) => {
                                    setIncludeHidden(e.target.checked);
                                    setTabsState((prev) => ({
                                        ...prev,
                                        [activeTab]: { ...prev[activeTab], currentPage: 1, hasFetched: false },
                                    }));
                                }}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Include Hidden</span>
                        </label>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <span>Limit:</span>
                            <select
                                value={currentTabState.limit}
                                onChange={(e) => handleLimitChange(Number(e.target.value))}
                                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500">
                            {currentTabState.pagination.total} publication{currentTabState.pagination.total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>

            {/* Publications Container (List or Calendar) */}
            <PublicationsContainer
                posts={currentTabState.posts}
                pagination={currentTabState.pagination}
                currentPage={currentTabState.currentPage}
                onPageChange={handlePageChange}
                onUpdate={async (postId, updates) => {
                    await updatePostHook(postId, updates);
                    await refetchCurrentTab();
                }}
                onSchedule={async (postId, scheduleData) => {
                    await schedulePostHook(postId, scheduleData);
                    await refetchCurrentTab();
                }}
                onDelete={async (postId) => {
                    await deletePostHook(postId);
                    await refetchCurrentTab();
                }}
                onAddToQueue={async (postId) => {
                    await addPostToQueueHook(postId);
                    await refetchCurrentTab();
                }}
                loading={isLoading}
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

