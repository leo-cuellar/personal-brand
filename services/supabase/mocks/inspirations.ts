import { randomUUID } from "crypto";
import { Inspiration } from "../schemas";
import { MOCK_PERSON_ID } from "./persons";

export const mockInspirations: Inspiration[] = [
    {
        id: randomUUID(),
        personId: MOCK_PERSON_ID as unknown as string,
        text: "Hablar sobre cómo la tecnología está cambiando la forma en que trabajamos y vivimos",
        link: null,
        source: "manual",
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
    },
];

