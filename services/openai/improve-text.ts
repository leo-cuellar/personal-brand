import { openai } from "./client";

export interface ImproveTextParams {
    currentText: string;
    userInstruction: string;
}

export async function improveText(params: ImproveTextParams): Promise<string> {
    const { currentText, userInstruction } = params;

    const completion = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
            {
                role: "system",
                content:
                    "You are an expert text editor for social media publications. Your task is to modify text according to user instructions.\n\n" +
                    "IMPORTANT RULES:\n" +
                    "1. If the user asks to REWRITE, REESCRIBIR, or completely transform the text, you should create a new version that maintains the core message but allows for significant changes in structure, wording, and style.\n" +
                    "2. If the user asks to modify a SPECIFIC part (e.g., 'change the first paragraph', 'fix this sentence'), only modify that specific part and keep everything else unchanged.\n" +
                    "3. If the user asks to improve, enhance, or polish the text, you can make broader improvements while maintaining the original meaning and structure.\n" +
                    "4. Always preserve the main message and intent of the original text unless explicitly asked to change it.\n" +
                    "5. Return ONLY the complete modified text, ready to publish. Do NOT include explanations, introductions, section headers, or meta-commentary.\n\n" +
                    "Analyze the user's instruction carefully to determine the scope of changes needed.",
            },
            {
                role: "user",
                content: `Current text:\n\n${currentText}\n\nUser instruction: ${userInstruction}\n\nReturn ONLY the complete modified text, ready to publish. Do NOT include any explanations, introductions, or meta-commentary.`,
            },
        ]
    });

    const improvedText = completion.choices[0]?.message?.content?.trim();

    if (!improvedText) {
        throw new Error("Failed to improve text");
    }

    return improvedText;
}

