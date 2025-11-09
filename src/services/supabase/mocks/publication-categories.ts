import { randomUUID } from "crypto";
import { PublicationCategory } from "../schemas";
import { MOCK_PERSON_ID } from "./persons";

export const mockPublicationCategories: PublicationCategory[] = [
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Technology",
        description: "Front-end development principles, emerging technologies like AI and blockchain, and the evolving landscape of software engineering. Building impactful products, leading high-performance technical teams, and navigating the intersection of code, strategy, and business value. Practical insights for developers in LATAM seeking to elevate their craft and claim their place in the global tech industry.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: true,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Career Development",
        description: "Non-traditional career paths, overcoming barriers, and redefining success in technology. Strategies for skill development, building personal brand, and navigating career transitions without following conventional routes. Addresses the challenges of starting late, dealing with imposter syndrome, and transforming from survival mode into a deliberate, purpose-driven career.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: false,
    },
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        name: "Leadership",
        description: "Leading technical teams, empowering developers, and building high-impact organizations. Principles of management that go beyond code, focusing on strategy, vision, and unlocking the potential of talented individuals. Bridging the gap between execution and business value while fostering growth and recognition for technical professionals.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        useForSearch: false,
    },
];

