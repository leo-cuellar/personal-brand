import { openai } from "./client";
import { getPersonData, getStrongOpinions } from "./data-helpers";

export interface GenerateCategoryDescriptionParams {
    categoryName: string;
    personId: string;
}

export async function generateCategoryDescription(
    params: GenerateCategoryDescriptionParams
): Promise<string> {
    const { categoryName, personId } = params;

    // Get person data and strong opinions
    const [person, strongOpinions] = await Promise.all([
        getPersonData(personId),
        getStrongOpinions(personId),
    ]);

    if (!person) {
        throw new Error("Person not found");
    }

    // Build context from person data
    const personContext = `
Personal Brand Information:
- Name: ${person.name}
- Immediate Credibility: ${person.immediateCredibility}
- Professional Problem/Challenge: ${person.professionalProblemOrChallenge}
- Internal Struggles: ${person.internalStruggles}
- External Context: ${person.externalContext}
- Key Microtransitions: ${person.keyMicrotransitions}
- Insight/Spark: ${person.insightOrSpark}
- Process: ${person.process}
- Result/Transformation: ${person.resultOrTransformation}
- Shared Beliefs: ${person.sharedBeliefs}
- Current Vision/Personal Mission: ${person.currentVisionOrPersonalMission}
- Social Proof/Validation: ${person.socialProofOrValidation}
- Call to Action: ${person.callToAction}
`.trim();

    // Build strong opinions context
    const strongOpinionsContext =
        strongOpinions.length > 0
            ? `\n\nStrong Opinions:\n${strongOpinions.map((so, idx) => `${idx + 1}. ${so.opinion}`).join("\n")}`
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
                content: `Generate a brief, descriptive text (2-3 sentences) for a publication category. DO NOT include the category name/title in the description. 

Category name: "${categoryName}"

Personal brand context:
${personContext}${strongOpinionsContext}

Requirements:
- Write in third person, impersonal style
- Do NOT mention any person's name
- Do NOT use possessive pronouns (my, their, his, her, etc.)
- Focus on the topics, themes, and content areas covered
- Describe what kind of content and discussions this category encompasses
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

