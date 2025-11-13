"use client";

import { useEffect, useState } from "react";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/Icon";

interface PersonalBrandStrongOpinionsProps {
    username: string;
    opinions: string[] | null; // null means not loaded yet, [] means loaded but empty
    loading: boolean;
    error: string | null;
    onLoad: (username: string) => Promise<void>;
    onUpdate: (username: string, opinions: string[]) => Promise<void>;
    onAddNewClick?: () => void;
    isAddingNew?: boolean;
    onCancelAdd?: () => void;
    newOpinionValue?: string;
    onNewOpinionValueChange?: (value: string) => void;
    onSaveNew?: () => Promise<void>;
}

export function PersonalBrandStrongOpinions({
    username,
    opinions,
    loading,
    error,
    onLoad,
    onUpdate,
    onAddNewClick,
    isAddingNew: externalIsAddingNew,
    onCancelAdd,
    newOpinionValue: externalNewOpinionValue,
    onNewOpinionValueChange,
    onSaveNew: externalOnSaveNew,
}: PersonalBrandStrongOpinionsProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [opinionValue, setOpinionValue] = useState("");
    const [internalIsAddingNew, setInternalIsAddingNew] = useState(false);
    const [internalNewOpinionValue, setInternalNewOpinionValue] = useState("");
    
    const isAddingNew = externalIsAddingNew !== undefined ? externalIsAddingNew : internalIsAddingNew;
    const newOpinionValue = externalNewOpinionValue !== undefined ? externalNewOpinionValue : internalNewOpinionValue;
    
    const setNewOpinionValue = (value: string) => {
        if (onNewOpinionValueChange) {
            onNewOpinionValueChange(value);
        } else {
            setInternalNewOpinionValue(value);
        }
    };

    useEffect(() => {
        // Only fetch if opinions are not already loaded (null means not loaded yet)
        if (opinions === null && !loading) {
            onLoad(username);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username]);

    const handleEditOpinion = (index: number) => {
        if (!opinions) return;
        setOpinionValue(opinions[index] || "");
        setEditingIndex(index);
        if (externalIsAddingNew === undefined) {
            setInternalIsAddingNew(false);
        }
    };

    const handleSaveOpinion = async () => {
        if (!opinions || editingIndex === null) return;

        try {
            const updatedOpinions = [...opinions];
            updatedOpinions[editingIndex] = opinionValue;
            await onUpdate(username, updatedOpinions);
            setEditingIndex(null);
            setOpinionValue("");
        } catch (err) {
            console.error("Failed to update opinion:", err);
            // TODO: Show error message to user
        }
    };

    const handleCancelOpinion = () => {
        setEditingIndex(null);
        setOpinionValue("");
    };

    const handleAddNew = () => {
        if (externalIsAddingNew === undefined) {
            setInternalIsAddingNew(true);
        }
        if (onAddNewClick) {
            onAddNewClick();
        }
        setNewOpinionValue("");
        setEditingIndex(null);
    };

    const handleSaveNew = async () => {
        if (externalOnSaveNew) {
            await externalOnSaveNew();
            return;
        }
        
        if (!opinions) return;

        try {
            const updatedOpinions = [newOpinionValue, ...opinions];
            await onUpdate(username, updatedOpinions);
            if (externalIsAddingNew === undefined) {
                setInternalIsAddingNew(false);
            } else if (onCancelAdd) {
                onCancelAdd();
            }
            setNewOpinionValue("");
        } catch (err) {
            console.error("Failed to add opinion:", err);
            // TODO: Show error message to user
        }
    };

    const handleCancelNew = () => {
        if (externalIsAddingNew === undefined) {
            setInternalIsAddingNew(false);
        } else if (onCancelAdd) {
            onCancelAdd();
        }
        setNewOpinionValue("");
    };

    const handleDeleteOpinion = async (index: number) => {
        if (!opinions) return;

        try {
            const updatedOpinions = opinions.filter((_, i) => i !== index);
            await onUpdate(username, updatedOpinions);
        } catch (err) {
            console.error("Failed to delete opinion:", err);
            // TODO: Show error message to user
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-sm text-gray-600">Loading strong opinions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (opinions === null) {
        // Still loading or not loaded yet
        return null;
    }

    return (
        <>
            {opinions.length === 0 && !isAddingNew ? (
                <div className="text-sm text-gray-400">No strong opinions added yet</div>
            ) : (
                <ul className="space-y-4">
                    {opinions.map((opinion, index) => {
                        const isEditing = editingIndex === index;

                        return (
                            <li key={index} className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-b-0">
                                <div className="flex items-start justify-between gap-2">
                                    {isEditing ? (
                                        <>
                                            <div className="flex-1">
                                                <textarea
                                                    value={opinionValue}
                                                    onChange={(e) => setOpinionValue(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    rows={3}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <IconButton
                                                    icon="check"
                                                    onClick={handleSaveOpinion}
                                                    iconColor="#10b981"
                                                    backgroundColor="#d1fae5"
                                                    hoverBackgroundColor="#a7f3d0"
                                                />
                                                <IconButton
                                                    icon="close"
                                                    onClick={handleCancelOpinion}
                                                    iconColor="#ef4444"
                                                    backgroundColor="#fee2e2"
                                                    hoverBackgroundColor="#fecaca"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 text-sm text-gray-700 whitespace-pre-wrap">
                                                {opinion}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <IconButton
                                                    icon="edit"
                                                    onClick={() => handleEditOpinion(index)}
                                                />
                                                <IconButton
                                                    icon="delete"
                                                    onClick={() => handleDeleteOpinion(index)}
                                                    iconColor="#ef4444"
                                                    backgroundColor="#fee2e2"
                                                    hoverBackgroundColor="#fecaca"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}

