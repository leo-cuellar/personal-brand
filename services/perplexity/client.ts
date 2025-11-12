import Perplexity from "@perplexity-ai/perplexity_ai";

if (!process.env.PERPLEXITY_SECRET_KEY) {
    throw new Error("PERPLEXITY_SECRET_KEY is not set in environment variables");
}

export const perplexity = new Perplexity({
    apiKey: process.env.PERPLEXITY_SECRET_KEY,
});

