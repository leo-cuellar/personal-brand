import { randomUUID } from "crypto";
import { Inspiration } from "../schemas";
import { MOCK_PERSON_ID } from "./personal-brands";

export const mockInspirations: Inspiration[] = [
    {
        id: randomUUID(),
        personalBrandId: MOCK_PERSON_ID as unknown as string,
        text: "Hablar sobre cómo la tecnología está cambiando la forma en que trabajamos y vivimos",
        link: "https://www.google.com",
        source: "trend_scanner",
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

