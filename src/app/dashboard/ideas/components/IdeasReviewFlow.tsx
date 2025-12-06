"use client";

import { useState, useEffect } from "react";
import type { PublicationIdea } from "../../../../../services/supabase/schemas";

interface IdeasReviewFlowProps {
    ideas: PublicationIdea[];
    onAccept: (id: string) => Promise<void>;
    onReject: (id: string) => Promise<void>;
    onExit: () => void;
}

export function IdeasReviewFlow({ ideas, onAccept, onReject, onExit }: IdeasReviewFlowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const [lastProcessedId, setLastProcessedId] = useState<string | null>(null);

    const currentIdea = ideas[currentIndex];
    const totalIdeas = ideas.length;
    const progress = totalIdeas > 0 ? ((currentIndex + completedCount) / totalIdeas) * 100 : 0;
    const isLastIdea = currentIndex === totalIdeas - 1;

    // Handle list changes after processing - if the last processed idea is gone, the list updated
    useEffect(() => {
        if (!isProcessing && lastProcessedId) {
            // Check if the last processed idea is still in the list
            const stillExists = ideas.some(idea => idea.id === lastProcessedId);

            if (!stillExists) {
                // The idea was removed (accepted/rejected), list was updated
                // Check if we need to adjust the index
                if (ideas.length === 0) {
                    // No more ideas, exit
                    onExit();
                } else if (currentIndex >= ideas.length) {
                    // Index is out of bounds, exit
                    onExit();
                } else {
                    // Index is still valid, it now points to the next idea
                    // Clear the last processed ID so we can process the next one
                    // Use setTimeout to avoid synchronous setState in effect
                    setTimeout(() => setLastProcessedId(null), 0);
                }
            }
        } else if (!isProcessing && ideas.length === 0) {
            // No more ideas, exit
            onExit();
        } else if (!isProcessing && currentIndex >= ideas.length && ideas.length > 0) {
            // Index is out of bounds but there are still ideas, reset to 0
            // Use setTimeout to avoid synchronous setState in effect
            setTimeout(() => setCurrentIndex(0), 0);
        }
    }, [ideas, isProcessing, lastProcessedId, currentIndex, onExit]);

    const handleAccept = async () => {
        if (!currentIdea || isProcessing) return;

        setIsProcessing(true);
        const currentId = currentIdea.id;
        try {
            await onAccept(currentId);
            setCompletedCount((prev) => prev + 1);
            setLastProcessedId(currentId);
            setIsProcessing(false);
            // The parent will refetch, and the useEffect above will handle advancing
        } catch (error) {
            alert(`Failed to accept idea: ${error instanceof Error ? error.message : "Unknown error"}`);
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!currentIdea || isProcessing) return;

        setIsProcessing(true);
        const currentId = currentIdea.id;
        try {
            await onReject(currentId);
            setCompletedCount((prev) => prev + 1);
            setLastProcessedId(currentId);
            setIsProcessing(false);
            // The parent will refetch, and the useEffect above will handle advancing
        } catch (error) {
            alert(`Failed to reject idea: ${error instanceof Error ? error.message : "Unknown error"}`);
            setIsProcessing(false);
        }
    };

    // If no ideas, show completion message
    if (totalIdeas === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
                <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl">
                    <div className="text-center">
                        <div className="mb-4 text-6xl">✅</div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">All Done!</h2>
                        <p className="mb-6 text-gray-600">You&apos;ve reviewed all ideas.</p>
                        <button
                            onClick={onExit}
                            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Back to Ideas
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header with progress and exit */}
            <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                            <span>Review Mode</span>
                            <span>
                                Idea {currentIndex + 1} of {totalIdeas}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={onExit}
                        disabled={isProcessing}
                        className="ml-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Exit Review
                    </button>
                </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="mx-auto w-full max-w-3xl">
                    {/* Idea Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                        <div className="mb-6">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                {currentIdea.title}
                            </h2>
                            {currentIdea.description && (
                                <p className="text-lg leading-relaxed text-gray-700">
                                    {currentIdea.description}
                                </p>
                            )}
                            {currentIdea.link && (
                                <div className="mt-4">
                                    <a
                                        href={currentIdea.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {currentIdea.link}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-gray-200 bg-white px-6 py-8">
                <div className="mx-auto flex max-w-4xl items-center justify-center gap-6">
                    <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        title="Reject"
                    >
                        <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            {isLastIdea ? "Last idea" : `${totalIdeas - currentIndex - 1} remaining`}
                        </p>
                    </div>

                    <button
                        onClick={handleAccept}
                        disabled={isProcessing}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:scale-105 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        title="Accept"
                    >
                        <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

