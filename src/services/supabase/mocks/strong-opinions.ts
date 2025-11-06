import { randomUUID } from "crypto";
import { StrongOpinion } from "../schemas";

export const mockStrongOpinions: StrongOpinion[] = [
    {
        id: randomUUID(),
        opinion:
            "Remote work isn't just a trend—it's the future of how we'll work. Companies that don't adapt will lose top talent.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        opinion:
            "AI won't replace humans, but humans who use AI will replace those who don't. The question isn't if, but when you'll adapt.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        opinion:
            "The 40-hour work week is dead. Productivity isn't about hours logged—it's about results delivered. Time to rethink how we measure work.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        opinion:
            "If you're not building your personal brand online, you're invisible. Your next opportunity won't find you—you need to make yourself findable.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
    {
        id: randomUUID(),
        opinion:
            "Networking isn't about collecting contacts—it's about building genuine relationships. Quality over quantity, always.",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

