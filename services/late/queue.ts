/**
 * Late.dev Queue Service
 * Handles direct API calls to Late.dev for queue management
 * This service should only be called from server-side code (API routes)
 */

export interface QueueSlot {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    time: string; // Format: "HH:mm" (e.g., "09:00", "14:00")
}

export interface UpdateQueueSlotsRequest {
    profileId: string;
    timezone: string;
    slots: QueueSlot[];
    active: boolean;
    reshuffleExisting?: boolean;
}

export interface QueueSlotsResponse {
    success: boolean;
    message?: string;
}

export interface QueueScheduleSlot {
    dayOfWeek: number;
    time: string;
}

export interface QueueSchedule {
    profileId: string;
    timezone: string;
    slots: QueueScheduleSlot[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetQueueSlotsResponse {
    exists: boolean;
    schedule?: QueueSchedule;
    nextSlots?: string[]; // ISO 8601 UTC format
}

export interface DeleteQueueSlotsResponse {
    success: boolean;
    deleted: boolean;
}

export interface NextSlotResponse {
    profileId: string;
    nextSlot: string; // ISO 8601 format
    timezone: string;
}

/**
 * Update queue slots in Late.dev
 * @param requestData - The queue slots configuration
 * @returns Success response
 */
export async function updateQueueSlots(
    requestData: UpdateQueueSlotsRequest
): Promise<QueueSlotsResponse> {
    const apiKey = process.env.LATE_SECRET_KEY;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    const url = "https://getlate.dev/api/v1/queue/slots";

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        let errorData: { error?: string; message?: string };
        let errorText = "";
        try {
            errorText = await response.text();
            errorData = JSON.parse(errorText);
        } catch {
            throw new Error(
                `Failed to update queue slots (${response.status}): ${errorText || response.statusText}`
            );
        }

        console.error("[Late.dev Queue] Error details:", {
            status: response.status,
            errorData,
            url,
        });

        const errorMessage =
            errorData.message || errorData.error || `Failed to update queue slots: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

/**
 * Get queue slots configuration from Late.dev
 * @param profileId - The profile ID to get queue slots for
 * @returns Queue slots configuration
 */
export async function getQueueSlots(
    profileId: string
): Promise<GetQueueSlotsResponse> {
    const apiKey = process.env.LATE_SECRET_KEY;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    const url = `https://getlate.dev/api/v1/queue/slots?profileId=${encodeURIComponent(profileId)}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        let errorData: { error?: string; message?: string };
        let errorText = "";
        try {
            errorText = await response.text();
            errorData = JSON.parse(errorText);
        } catch {
            throw new Error(
                `Failed to get queue slots (${response.status}): ${errorText || response.statusText}`
            );
        }

        console.error("[Late.dev Queue] GET Error details:", {
            status: response.status,
            errorData,
            url,
        });

        const errorMessage =
            errorData.message || errorData.error || `Failed to get queue slots: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

/**
 * Delete queue slots configuration from Late.dev
 * @param profileId - The profile ID to delete queue slots for
 * @returns Delete response
 */
export async function deleteQueueSlots(
    profileId: string
): Promise<DeleteQueueSlotsResponse> {
    const apiKey = process.env.LATE_SECRET_KEY;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    const url = `https://getlate.dev/api/v1/queue/slots?profileId=${encodeURIComponent(profileId)}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        let errorData: { error?: string; message?: string };
        let errorText = "";
        try {
            errorText = await response.text();
            errorData = JSON.parse(errorText);
        } catch {
            throw new Error(
                `Failed to delete queue slots (${response.status}): ${errorText || response.statusText}`
            );
        }

        console.error("[Late.dev Queue] DELETE Error details:", {
            status: response.status,
            errorData,
            url,
        });

        const errorMessage =
            errorData.message || errorData.error || `Failed to delete queue slots: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

/**
 * Get next available slot from queue
 * Always uses LATE_PROFILE_ID from environment variables (ignores profileId parameter)
 * @returns Next available slot information
 */
export async function getNextSlot(): Promise<NextSlotResponse> {
    const apiKey = process.env.LATE_SECRET_KEY;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    // Always use profileId from environment variables
    const profileId = process.env.LATE_PROFILE_ID;

    if (!profileId) {
        throw new Error("LATE_PROFILE_ID is not configured");
    }

    const url = `https://getlate.dev/api/v1/queue/next-slot?profileId=${encodeURIComponent(profileId)}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        let errorData: { error?: string; message?: string };
        let errorText = "";
        try {
            errorText = await response.text();
            errorData = JSON.parse(errorText);
        } catch {
            throw new Error(
                `Failed to get next slot (${response.status}): ${errorText || response.statusText}`
            );
        }

        console.error("[Late.dev Queue] GET Next Slot Error details:", {
            status: response.status,
            errorData,
            url,
        });

        const errorMessage =
            errorData.message || errorData.error || `Failed to get next slot: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
}

