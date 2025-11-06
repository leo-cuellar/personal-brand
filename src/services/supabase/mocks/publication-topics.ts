import { randomUUID } from "crypto";
import { PublicationTopic } from "../schemas";

export const mockPublicationTopics: PublicationTopic[] = [
    {
        id: randomUUID(),
        name: "Technology",
        description: "Posts about technology, software development, AI, and tech trends",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        name: "Career Development",
        description: "Content about career growth, job searching, professional skills, and workplace advice",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        name: "Leadership",
        description: "Thoughts on leadership, management, team building, and organizational culture",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        name: "Productivity",
        description: "Tips and strategies for improving productivity, time management, and work-life balance",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        name: "Entrepreneurship",
        description: "Content about starting businesses, entrepreneurship, startups, and innovation",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

