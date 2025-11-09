import { randomUUID } from "crypto";
import { PublicationCategory } from "../schemas";
import { MOCK_PERSON_ID } from "./persons";

export const mockPublicationCategories: PublicationCategory[] = [
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Technology",
        description: "Posts about technology, software development, AI, and tech trends",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Career Development",
        description: "Content about career growth, job searching, professional skills, and workplace advice",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Leadership",
        description: "Thoughts on leadership, management, team building, and organizational culture",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Productivity",
        description: "Tips and strategies for improving productivity, time management, and work-life balance",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Entrepreneurship",
        description: "Content about starting businesses, entrepreneurship, startups, and innovation",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

