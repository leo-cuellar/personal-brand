import { randomUUID } from "crypto";
import { PublicationIdea } from "../schemas";
import { MOCK_PERSON_ID } from "./persons";

export const mockPublicationIdeas: PublicationIdea[] = [
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        idea: "How to build a personal brand on LinkedIn in 30 days",
        description: "A step-by-step guide for professionals looking to establish their online presence",
        status: "in_review",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        idea: "The future of remote work: lessons learned from 3 years of distributed teams",
        description: "Share insights from managing remote teams and what the future holds",
        status: "accepted",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        idea: "5 productivity tools that changed how I work in 2024",
        description: "Review of tools that have had the biggest impact on daily productivity",
        status: "in_review",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        idea: "Why I left my 6-figure job to start a business (and what I learned)",
        description: "Personal story about the transition from employee to entrepreneur",
        status: "rejected",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        idea: "The one leadership mistake I made that cost me my best employee",
        description: "Reflection on leadership failures and lessons learned",
        status: "in_review",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        idea: "AI is not replacing developers - it's making us 10x more productive",
        description: "Contrarian take on AI in software development",
        status: "accepted",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

