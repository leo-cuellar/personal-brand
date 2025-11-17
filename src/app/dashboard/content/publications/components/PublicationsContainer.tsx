"use client";

import { PublicationsList } from "./PublicationsList";
import type { LatePost } from "../../../../../../services/late/posts";

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
    onDelete: (postId: string) => Promise<void>;
    onAddToQueue: (postId: string) => Promise<void>;
    loading: boolean;
}

export function PublicationsContainer({
    posts,
    pagination,
    currentPage,
    onPageChange,
    onUpdate,
    onSchedule,
    onDelete,
    onAddToQueue,
    loading,
}: PublicationsContainerProps) {
    return (
        <PublicationsList
            posts={posts}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onUpdate={onUpdate}
            onSchedule={onSchedule}
            onDelete={onDelete}
            onAddToQueue={onAddToQueue}
            loading={loading}
        />
    );
}

