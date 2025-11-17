import { openai } from "./client";

export interface ImproveTextParams {
    currentText: string;
    userInstruction: string;
}

export async function improveText(params: ImproveTextParams): Promise<string> {
    const { currentText, userInstruction } = params;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are a text editor that modifies publication text according to user instructions. You must be STRICT: only modify what the user explicitly requests. If the user asks to change a specific paragraph, only modify that paragraph and leave everything else unchanged. Return ONLY the complete modified text, ready to publish. Do NOT include explanations, introductions, section headers, or any meta-commentary. Just return the final text.",
            },
            {
                role: "user",
                content: `Current text:\n\n${currentText}\n\nUser instruction: ${userInstruction}\n\nReturn ONLY the complete modified text, ready to publish. Do NOT include any explanations, introductions, or meta-commentary.`,
            },
        ],
        temperature: 0.7,
    });

    const improvedText = completion.choices[0]?.message?.content?.trim();

    if (!improvedText) {
        throw new Error("Failed to improve text");
    }

    return improvedText;
}

