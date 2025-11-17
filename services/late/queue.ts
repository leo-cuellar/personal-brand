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

    console.log("[Late.dev Queue] Request URL:", url);
    console.log("[Late.dev Queue] Request data:", JSON.stringify(requestData, null, 2));

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestData),
    });

    console.log("[Late.dev Queue] Response status:", response.status);

    if (!response.ok) {
        let errorData: { error?: string; message?: string };
        let errorText = "";
        try {
            errorText = await response.text();
            console.log("[Late.dev Queue] Error response text:", errorText);
            errorData = JSON.parse(errorText);
            console.log("[Late.dev Queue] Error response parsed:", JSON.stringify(errorData, null, 2));
        } catch (parseError) {
            console.log("[Late.dev Queue] Failed to parse error response:", parseError);
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
    console.log("[Late.dev Queue] Success response:", data);
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

    console.log("[Late.dev Queue] GET Request URL:", url);

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    console.log("[Late.dev Queue] GET Response status:", response.status);

    if (!response.ok) {
        let errorData: { error?: string; message?: string };
        let errorText = "";
        try {
            errorText = await response.text();
            console.log("[Late.dev Queue] GET Error response text:", errorText);
            errorData = JSON.parse(errorText);
            console.log("[Late.dev Queue] GET Error response parsed:", JSON.stringify(errorData, null, 2));
        } catch (parseError) {
            console.log("[Late.dev Queue] GET Failed to parse error response:", parseError);
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
    console.log("[Late.dev Queue] GET Success response:", data);
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

    console.log("[Late.dev Queue] DELETE Request URL:", url);

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    console.log("[Late.dev Queue] DELETE Response status:", response.status);

    if (!response.ok) {
        let errorData: { error?: string; message?: string };
        let errorText = "";
        try {
            errorText = await response.text();
            console.log("[Late.dev Queue] DELETE Error response text:", errorText);
            errorData = JSON.parse(errorText);
            console.log("[Late.dev Queue] DELETE Error response parsed:", JSON.stringify(errorData, null, 2));
        } catch (parseError) {
            console.log("[Late.dev Queue] DELETE Failed to parse error response:", parseError);
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
    console.log("[Late.dev Queue] DELETE Success response:", data);
    return data;
}

