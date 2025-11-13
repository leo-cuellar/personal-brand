import { openai } from "./client";
import { getPersonalBrandData } from "./data-helpers";

export interface GenerateCategoryDescriptionParams {
    categoryName: string;
    personalBrandId: string;
}

export async function generateCategoryDescription(
    params: GenerateCategoryDescriptionParams
): Promise<string> {
    const { categoryName, personalBrandId } = params;

    // Get personal brand data (includes strong opinions)
    const personalBrand = await getPersonalBrandData(personalBrandId);

    if (!personalBrand) {
        throw new Error("Personal brand not found");
    }

    // Build context from personal brand data
    const personContext = `
Personal Brand Information:
- Name: ${personalBrand.name}
- Immediate Credibility: ${personalBrand.brandNarrative.immediateCredibility}
- Professional Problem/Challenge: ${personalBrand.brandNarrative.professionalProblemOrChallenge}
- Internal Struggles: ${personalBrand.brandNarrative.internalStruggles}
- External Context: ${personalBrand.brandNarrative.externalContext}
- Key Microtransitions: ${personalBrand.brandNarrative.keyMicrotransitions}
- Insight/Spark: ${personalBrand.brandNarrative.insightOrSpark}
- Process: ${personalBrand.brandNarrative.process}
- Result/Transformation: ${personalBrand.brandNarrative.resultOrTransformation}
- Shared Beliefs: ${personalBrand.brandNarrative.sharedBeliefs}
- Current Vision/Personal Mission: ${personalBrand.brandNarrative.currentVisionOrPersonalMission}
- Social Proof/Validation: ${personalBrand.brandNarrative.socialProofOrValidation}
- Call to Action: ${personalBrand.brandNarrative.callToAction}
`.trim();

    // Build strong opinions context
    const strongOpinionsContext =
        personalBrand.strongOpinions && personalBrand.strongOpinions.length > 0
            ? `\n\nStrong Opinions:\n${personalBrand.strongOpinions.map((opinion, idx) => `${idx + 1}. ${opinion}`).join("\n")}`
            : "";

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful assistant that generates concise, descriptive text for publication categories. The description will be used for trend analysis and content discovery. Write in an impersonal, third-person style that describes the topics, themes, and content focus without mentioning any person's name or using possessive pronouns like 'my', 'their', or 'his/her'. Focus on what content themes and topics are covered, not who writes them.",
            },
            {
                role: "user",
                content: `Generate a brief, descriptive text (2-3 sentences) for a publication category. 

CRITICAL: Start directly with the topic/content. DO NOT use introductory phrases like:
- "Content explores..."
- "This category covers..."
- "Content within this category focuses on..."
- "Discussions include..."
- "This category delves into..."

Instead, start directly with the subject matter. Examples:
BAD: "Content explores the principles and best practices of front-end development..."
GOOD: "Principles and best practices of front-end development, emphasizing user experience..."

BAD: "This category covers strategies for navigating career transitions..."
GOOD: "Strategies for navigating career transitions, focusing on skill development..."

Category name: "${categoryName}"

Personal brand context:
Personal brand: ${personContext}
Strong opinions: ${strongOpinionsContext}

Requirements:
- Start directly with the topic/subject matter (no introductory phrases)
- Write in third person, impersonal style
- Do NOT mention any person's name
- Do NOT use possessive pronouns (my, their, his, her, etc.)
- Do NOT reference "this category", "content", "discussions", etc.
- Focus on the topics, themes, and content areas covered
- Make it descriptive and suitable for trend analysis/search
- Keep it professional and clear
- 2-3 sentences maximum`,
            },
        ],
        temperature: 0.7,
    });

    const description = completion.choices[0]?.message?.content?.trim();

    if (!description) {
        throw new Error("Failed to generate description");
    }

    return description;
}

