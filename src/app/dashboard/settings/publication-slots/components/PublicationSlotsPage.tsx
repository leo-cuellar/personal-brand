"use client";

import { useState, useEffect } from "react";
import { useLate } from "@/hooks/useLate";
import { useRouter } from "next/navigation";
import type { UpdateQueueSlotsRequest, QueueSlot, QueueScheduleSlot } from "../../../../../../services/late/queue";
import { Icon } from "@/components/Icon";

const DAYS_OF_WEEK = [
    { label: "Sun", value: 0, fullLabel: "Sunday" },
    { label: "Mon", value: 1, fullLabel: "Monday" },
    { label: "Tue", value: 2, fullLabel: "Tuesday" },
    { label: "Wed", value: 3, fullLabel: "Wednesday" },
    { label: "Thu", value: 4, fullLabel: "Thursday" },
    { label: "Fri", value: 5, fullLabel: "Friday" },
    { label: "Sat", value: 6, fullLabel: "Saturday" },
];

interface SlotItem {
    id: string;
    dayOfWeek: number;
    time: string;
}

export function PublicationSlotsPage() {
    const router = useRouter();
    const { updateQueueSlots, getQueueSlots, loading, error } = useLate();

    const [timezone, setTimezone] = useState("America/Mexico_City");
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [newSlotTime, setNewSlotTime] = useState("09:00");
    const [slots, setSlots] = useState<SlotItem[]>([]);
    const [currentSchedule, setCurrentSchedule] = useState<{
        exists: boolean;
        schedule?: {
            profileId: string;
            timezone: string;
            slots: QueueScheduleSlot[];
            active: boolean;
            createdAt: string;
            updatedAt: string;
        };
        nextSlots?: string[];
    } | null>(null);
    const [loadingSchedule, setLoadingSchedule] = useState(true);

    // Load current schedule on mount
    useEffect(() => {
        const loadCurrentSchedule = async () => {
            try {
                setLoadingSchedule(true);
                const response = await getQueueSlots();
                setCurrentSchedule(response);

                // If schedule exists, populate the form with current values
                if (response.exists && response.schedule) {
                    setTimezone(response.schedule.timezone);
                    const existingSlots: SlotItem[] = response.schedule.slots.map((slot, index) => ({
                        id: `existing-${index}-${slot.dayOfWeek}-${slot.time}`,
                        dayOfWeek: slot.dayOfWeek,
                        time: slot.time,
                    }));
                    setSlots(existingSlots);
                }
            } catch (err) {
                console.error("Failed to load current schedule:", err);
            } finally {
                setLoadingSchedule(false);
            }
        };

        loadCurrentSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDayToggle = (dayOfWeek: number) => {
        setSelectedDays((prev) =>
            prev.includes(dayOfWeek)
                ? prev.filter((d) => d !== dayOfWeek)
                : [...prev, dayOfWeek]
        );
    };

    const handleAddSlots = () => {
        if (selectedDays.length === 0) {
            alert("Please select at least one day");
            return;
        }

        const newSlots: SlotItem[] = selectedDays.map((dayOfWeek) => ({
            id: `${Date.now()}-${dayOfWeek}-${Math.random()}`,
            dayOfWeek,
            time: newSlotTime,
        }));

        setSlots((prev) => [...prev, ...newSlots]);
        setSelectedDays([]);
        setNewSlotTime("09:00");
    };

    const handleSlotDayChange = (slotId: string, dayOfWeek: number) => {
        setSlots((prev) =>
            prev.map((slot) =>
                slot.id === slotId ? { ...slot, dayOfWeek } : slot
            )
        );
    };

    const handleSlotTimeChange = (slotId: string, time: string) => {
        setSlots((prev) =>
            prev.map((slot) => (slot.id === slotId ? { ...slot, time } : slot))
        );
    };

    const handleRemoveSlot = (slotId: string) => {
        setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    };


    const handleSave = async () => {
        try {
            const queueSlots: QueueSlot[] = slots.map((slot) => ({
                dayOfWeek: slot.dayOfWeek,
                time: slot.time,
            }));

            const requestData: UpdateQueueSlotsRequest = {
                profileId: "", // Will be set from env var in API route
                timezone,
                slots: queueSlots,
                active: true,
                reshuffleExisting: true, // Reorganize existing posts in queue when slots change
            };

            await updateQueueSlots(requestData);
            alert("Queue slots saved successfully!");

            // Reload current schedule after saving
            const response = await getQueueSlots();
            setCurrentSchedule(response);
        } catch (err) {
            alert(`Failed to save queue slots: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
    };


    if (loadingSchedule) {
        return (
            <div className="container mx-auto max-w-4xl p-8">
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="text-lg text-gray-600">Loading queue settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl p-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Queue Settings</h1>
                        <p className="mt-1 text-sm text-gray-500">Profile: Default Profile</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <Icon name="close" size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                {/* Current Schedule Info */}
                {currentSchedule?.exists && currentSchedule.schedule && (
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h2 className="mb-3 text-lg font-semibold text-gray-900">Current Schedule</h2>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">Status:</span>{" "}
                                <span className={currentSchedule.schedule.active ? "text-green-600" : "text-gray-500"}>
                                    {currentSchedule.schedule.active ? "Active" : "Inactive"}
                                </span>
                            </p>
                            <p>
                                <span className="font-medium">Timezone:</span> {currentSchedule.schedule.timezone}
                            </p>
                            <p>
                                <span className="font-medium">Slots configured:</span> {currentSchedule.schedule.slots.length}
                            </p>
                            {currentSchedule.nextSlots && currentSchedule.nextSlots.length > 0 && (
                                <div className="mt-3">
                                    <p className="mb-1 font-medium">Next scheduled slots:</p>
                                    <ul className="list-inside list-disc space-y-1">
                                        {currentSchedule.nextSlots.slice(0, 5).map((slot, index) => (
                                            <li key={index} className="text-xs">
                                                {new Date(slot).toLocaleString()}
                                            </li>
                                        ))}
                                        {currentSchedule.nextSlots.length > 5 && (
                                            <li className="text-xs text-gray-500">
                                                ... and {currentSchedule.nextSlots.length - 5} more
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timezone Section */}
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Timezone
                    </label>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                        <option value="America/Mexico_City">America/Mexico City (CST)</option>
                        <option value="America/New_York">America/New York (EST)</option>
                        <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                        <option value="America/Chicago">America/Chicago (CST)</option>
                        <option value="America/Denver">America/Denver (MST)</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>

                {/* Add Slots Section */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Add Slots</h2>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select days:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => handleDayToggle(day.value)}
                                    disabled={loading}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedDays.includes(day.value)
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <input
                                type="time"
                                value={newSlotTime}
                                onChange={(e) => setNewSlotTime(e.target.value)}
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddSlots}
                            disabled={loading || selectedDays.length === 0}
                            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Add Slots
                        </button>
                    </div>
                </div>

                {/* Slots List */}
                {slots.length > 0 && (
                    <div className="mb-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Slots ({slots.length})
                        </h2>
                        <div className="space-y-3">
                            {slots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
                                >
                                    <select
                                        value={slot.dayOfWeek}
                                        onChange={(e) =>
                                            handleSlotDayChange(
                                                slot.id,
                                                parseInt(e.target.value, 10)
                                            )
                                        }
                                        disabled={loading}
                                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    >
                                        {DAYS_OF_WEEK.map((d) => (
                                            <option key={d.value} value={d.value}>
                                                {d.fullLabel}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="time"
                                        value={slot.time}
                                        onChange={(e) =>
                                            handleSlotTimeChange(slot.id, e.target.value)
                                        }
                                        disabled={loading}
                                        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSlot(slot.id)}
                                        disabled={loading}
                                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Icon name="close" size={20} color="#dc2626" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading || slots.length === 0}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Schedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}

