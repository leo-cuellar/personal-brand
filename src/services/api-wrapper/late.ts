export interface LateSchedulePostRequest {
    text: string;
    schedule?: string; // ISO 8601 format (will be converted to scheduledFor)
    // platforms is always ["linkedin"] - not needed in request
}

export interface LatePlatformStatus {
    platform: string;
    status: "pending" | "published" | "failed";
    error?: string;
}

export interface LateSchedulePostResponse {
    id: string;
    status: "pending" | "published" | "failed";
    platforms: LatePlatformStatus[];
    schedule?: string;
    text: string;
}

export interface LateErrorResponse {
    error: string;
    message?: string;
}

/**
 * Schedule a post on Late.dev
 * @param request - The post data including platforms, text, and optional schedule
 * @returns The response from Late.dev API
 */
export async function schedulePost(
    request: LateSchedulePostRequest
): Promise<LateSchedulePostResponse> {
    const apiKey = process.env.LATE_SECRET_KEY;
    const profileId = process.env.LATE_PROFILE_ID;

    if (!apiKey) {
        throw new Error("LATE_SECRET_KEY is not configured");
    }

    if (!profileId) {
        throw new Error("LATE_PROFILE_ID is not configured");
    }

    // Validate text is not empty
    const trimmedText = request.text?.trim();
    if (!trimmedText || trimmedText.length === 0) {
        throw new Error("Text is required and cannot be empty");
    }

    // Always use LinkedIn as the platform
    // Late.dev expects 'content', 'platforms', 'scheduledFor', and 'timezone'
    // Option A (recommended): Local YYYY-MM-DDTHH:mm (no Z) + timezone
    // Timezone: CST = America/Chicago
    const timezone = "America/Chicago"; // CST timezone

    let scheduledFor: string | undefined;
    if (request.schedule) {
        // Convert UTC ISO string to CST local time using America/Chicago timezone
        const scheduleDate = new Date(request.schedule);

        // Use Intl.DateTimeFormat to convert to CST/CDT (handles DST automatically)
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Chicago",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const parts = formatter.formatToParts(scheduleDate);
        const year = parts.find((p) => p.type === "year")?.value || "";
        const month = parts.find((p) => p.type === "month")?.value || "";
        const day = parts.find((p) => p.type === "day")?.value || "";
        const hours = parts.find((p) => p.type === "hour")?.value || "";
        const minutes = parts.find((p) => p.type === "minute")?.value || "";

        // Format as YYYY-MM-DDTHH:mm (CST/CDT time, no Z)
        scheduledFor = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    const payload: {
        content: string;
        platforms: Array<{ platform: string; accountId: string }>;
        scheduledFor?: string;
        timezone?: string;
    } = {
        content: trimmedText,
        platforms: [
            {
                platform: "linkedin",
                accountId: profileId,
            },
        ],
        ...(scheduledFor && { scheduledFor }),
        ...(scheduledFor && { timezone }), // Include timezone when scheduledFor is present
    };

    // Log the final payload being sent to Late.dev
    console.log("Late.dev API payload:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://getlate.dev/api/v1/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorData: LateErrorResponse;
        try {
            errorData = await response.json();
        } catch {
            const errorText = await response.text();
            throw new Error(
                `Failed to schedule post (${response.status}): ${errorText || response.statusText}`
            );
        }

        // Late.dev might return error in different formats
        const errorMessage = errorData.message || errorData.error || `Failed to schedule post: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const data: LateSchedulePostResponse = await response.json();
    return data;
}

