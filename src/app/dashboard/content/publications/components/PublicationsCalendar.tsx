"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { LatePost } from "@/services/late/posts";

// Initialize date-fns localizer
const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
        post: LatePost;
    };
}

interface PublicationsCalendarProps {
    posts: LatePost[];
}

function getEventStyle(event: CalendarEvent) {
    const status = event.resource.post.status;
    let backgroundColor = "#e5e7eb"; // gray (draft)
    let borderColor = "#9ca3af";

    switch (status) {
        case "published":
            backgroundColor = "#d1fae5"; // green-200
            borderColor = "#10b981"; // green-500
            break;
        case "scheduled":
            backgroundColor = "#dbeafe"; // blue-200
            borderColor = "#3b82f6"; // blue-500
            break;
        case "failed":
            backgroundColor = "#fee2e2"; // red-200
            borderColor = "#ef4444"; // red-500
            break;
        case "draft":
        default:
            backgroundColor = "#f3f4f6"; // gray-100
            borderColor = "#6b7280"; // gray-500
            break;
    }

    return {
        style: {
            backgroundColor,
            borderColor,
            borderWidth: "2px",
            borderStyle: "solid",
            color: "#1f2937", // gray-800
            borderRadius: "4px",
        },
    };
}

export function PublicationsCalendar({ posts }: PublicationsCalendarProps) {
    // Filter posts that have scheduledFor
    const scheduledPosts = posts.filter((post) => post.scheduledFor);

    // Convert posts to calendar events
    const events: CalendarEvent[] = scheduledPosts.map((post) => {
        const scheduledDate = new Date(post.scheduledFor!);
        // Events are 1 hour long by default
        const endDate = new Date(scheduledDate);
        endDate.setHours(endDate.getHours() + 1);

        return {
            id: post._id,
            title: post.title || post.content.substring(0, 50) + (post.content.length > 50 ? "..." : ""),
            start: scheduledDate,
            end: endDate,
            resource: {
                post,
            },
        };
    });

    return (
        <div className="h-[600px] w-full">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                eventPropGetter={getEventStyle}
                defaultView="month"
                views={["month", "week", "day", "agenda"]}
                popup
            />
        </div>
    );
}

