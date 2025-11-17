"use client";

import { useState, useEffect } from "react";
import { useLate } from "@/hooks/useLate";
import { PublicationsContainer } from "./PublicationsContainer";
import type { LatePost } from "../../../../../../services/late/posts";

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

    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>("draft");
    const LIMIT = 20; // Hardcoded limit
    const [tabsState, setTabsState] = useState<Record<TabType, TabState>>({
        draft: {
            posts: [],
            pagination: { page: 1, limit: LIMIT, total: 0, pages: 0 },
            currentPage: 1,
            limit: LIMIT,
            hasFetched: false,
            loading: false,
        },
        queue: {
            posts: [],
            pagination: { page: 1, limit: LIMIT, total: 0, pages: 0 },
            currentPage: 1,
            limit: LIMIT,
            hasFetched: false,
            loading: false,
        },
        sent: {
            posts: [],
            pagination: { page: 1, limit: LIMIT, total: 0, pages: 0 },
            currentPage: 1,
            limit: LIMIT,
            hasFetched: false,
            loading: false,
        },
    });

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
                } = {
                    page: currentTabState.currentPage,
                    limit: LIMIT,
                    status: statusMap[activeTab],
                };

                const response = await getPosts(params);

                if (!cancelled) {
                    const filteredPosts = response.posts;

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
    }, [activeTab, tabsState[activeTab].currentPage, getPosts]);

    const handlePageChange = (newPage: number) => {
        setTabsState((prev) => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], currentPage: newPage, hasFetched: false },
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
        } = {
            page: currentTabState.currentPage,
            limit: LIMIT,
            status: statusMap[activeTab],
        };

        const response = await getPosts(params);
        const filteredPosts = response.posts;

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
            <div className="mb-6 flex items-center justify-between border-b border-gray-200">
                <div className="flex gap-2">
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
                <div>
                    <span className="text-sm text-gray-500">
                        {currentTabState.pagination.total} publication{currentTabState.pagination.total !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Publications Container */}
            <PublicationsContainer
                posts={currentTabState.posts}
                pagination={currentTabState.pagination}
                currentPage={currentTabState.currentPage}
                onPageChange={handlePageChange}
                onUpdate={async (postId, updates) => {
                    await updatePostHook(postId, updates);
                    // Refetch current tab after update
                    await refetchCurrentTab();
                }}
                onSchedule={async (postId, scheduleData) => {
                    await schedulePostHook(postId, scheduleData);
                    await refetchCurrentTab();
                    // Invalidate queue tab since a post was scheduled
                    if (activeTab !== "queue") {
                        setTabsState((prev) => ({
                            ...prev,
                            queue: { ...prev.queue, hasFetched: false },
                        }));
                    }
                }}
                onDelete={async (postId) => {
                    await deletePostHook(postId);
                    await refetchCurrentTab();
                    // Invalidate all tabs since deletion could affect any tab
                    setTabsState((prev) => ({
                        ...prev,
                        draft: { ...prev.draft, hasFetched: false },
                        queue: { ...prev.queue, hasFetched: false },
                        sent: { ...prev.sent, hasFetched: false },
                    }));
                }}
                onAddToQueue={async (postId) => {
                    await addPostToQueueHook(postId);
                    await refetchCurrentTab();
                    // Invalidate queue tab since a post was added to queue
                    if (activeTab !== "queue") {
                        setTabsState((prev) => ({
                            ...prev,
                            queue: { ...prev.queue, hasFetched: false },
                        }));
                    }
                }}
                loading={isLoading}
            />
        </div>
    );
}

