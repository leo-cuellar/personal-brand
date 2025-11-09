import OpenAI from "openai";

if (!process.env.OPENAI_SECRET_KEY) {
    throw new Error("OPENAI_SECRET_KEY is not set in environment variables");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY,
});

