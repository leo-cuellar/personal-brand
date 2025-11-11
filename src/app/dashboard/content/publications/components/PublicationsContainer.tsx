"use client";

import { useState } from "react";
import { PublicationsCalendar } from "./PublicationsCalendar";
import { PublicationsList } from "./PublicationsList";
import type { LatePost } from "@/services/late/posts";

type ViewMode = "list" | "calendar";

interface PublicationsContainerProps {
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
    // Calendar-specific props
    calendarDateFrom: string;
    calendarDateTo: string;
    onCalendarDateFromChange: (date: string) => void;
    onCalendarDateToChange: (date: string) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function PublicationsContainer({
    posts,
    pagination,
    currentPage,
    onPageChange,
    onUpdate,
    onSchedule,
    loading,
    calendarDateFrom,
    calendarDateTo,
    onCalendarDateFromChange,
    onCalendarDateToChange,
    viewMode,
    onViewModeChange,
}: PublicationsContainerProps) {

    return (
        <div>
            {/* View Mode Toggle */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewModeChange("list")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === "list"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => onViewModeChange("calendar")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === "calendar"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Calendar
                    </button>
                </div>

                {/* Calendar Date Range Filters */}
                {viewMode === "calendar" && (
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                From
                            </label>
                            <input
                                type="date"
                                value={calendarDateFrom}
                                onChange={(e) => onCalendarDateFromChange(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                To
                            </label>
                            <input
                                type="date"
                                value={calendarDateTo}
                                onChange={(e) => onCalendarDateToChange(e.target.value)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Render appropriate view */}
            {viewMode === "list" ? (
                <PublicationsList
                    posts={posts}
                    pagination={pagination}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    onUpdate={onUpdate}
                    onSchedule={onSchedule}
                    loading={loading}
                />
            ) : (
                <PublicationsCalendar
                    posts={posts}
                />
            )}
        </div>
    );
}

