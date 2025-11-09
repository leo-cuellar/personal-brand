"use client";

import { useMemo } from "react";
import { Calendar, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { Publication } from "@/services/supabase/schemas";

interface CalendarEvent extends Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Publication;
}

const DragAndDropCalendar = withDragAndDrop(Calendar);

// Setup the localizer using date-fns
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // Monday
    getDay,
    locales: { "en-US": enUS },
});

interface PublicationsCalendarProps {
    publications: Publication[];
    onSelectEvent?: (event: CalendarEvent) => void;
    onEventDrop?: (args: { event: CalendarEvent; start: Date; end: Date }) => void;
}

export function PublicationsCalendar({
    publications,
    onSelectEvent,
    onEventDrop,
}: PublicationsCalendarProps) {
    const events = useMemo(() => {
        return publications
            .filter((pub) => pub.scheduledAt || pub.publishedAt)
            .map((pub) => {
                const date = pub.scheduledAt || pub.publishedAt;
                if (!date) return null;

                const startDate = new Date(date);
                const endDate = new Date(startDate);
                endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration

                return {
                    id: pub.id,
                    title: pub.title || pub.content.substring(0, 50) + "...",
                    start: startDate,
                    end: endDate,
                    resource: pub,
                } as CalendarEvent;
            })
            .filter((event): event is CalendarEvent => event !== null);
    }, [publications]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const pub = event.resource;
        let backgroundColor = "#3174ad"; // Default blue

        if (pub.status === "published") {
            backgroundColor = "#10b981"; // Green
        } else if (pub.status === "scheduled") {
            backgroundColor = "#f59e0b"; // Yellow
        } else if (pub.status === "draft") {
            backgroundColor = "#6b7280"; // Gray
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "5px",
                opacity: 0.8,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    return (
        <div className="h-[600px]">
            {/* @ts-expect-error - react-big-calendar types are complex and don't match our CalendarEvent type exactly */}
            <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={onSelectEvent}
                onEventDrop={onEventDrop}
                defaultView="month"
                views={["month", "week", "day", "agenda"]}
            />
        </div>
    );
}

