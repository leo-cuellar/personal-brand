import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

// Personal stories table
// This table stores personal stories used for content generation, following a structured narrative framework
export const personalStories = pgTable("personal_stories", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Immediate credibility: Establishes authority and expertise upfront
    // Example: "He trabajado en empresas de tecnología que operan a nivel internacional..."
    immediateCredibility: text("immediate_credibility").notNull(),

    // Professional problem or challenge: The initial problem or challenge that started the journey
    // Example: "Después de cinco años en una carrera completamente distinta, tomé la decisión más difícil..."
    professionalProblemOrChallenge: text("professional_problem_or_challenge").notNull(),

    // Internal struggles: Personal doubts, transitions, and difficult decisions faced internally
    // Example: "Aunque era joven, sentía que ya había desperdiciado demasiado tiempo..."
    internalStruggles: text("internal_struggles").notNull(),

    // External context: The external environment, workplace conditions, undervaluation, lack of role models
    // Example: "Tuve que reconstruirme desde cero, en lo profesional y en lo personal..."
    externalContext: text("external_context").notNull(),

    // Key microtransitions: Important shifts in focus, new skills acquired, personal evolution
    // Example: "Pasé de explorar la programación como curiosidad a construir soluciones reales..."
    keyMicrotransitions: text("key_microtransitions").notNull(),

    // Insight or spark: The pivotal idea, belief, or vision that changed the direction
    // Example: "Descubrí que podía construir. No solo una carrera, sino ideas, productos..."
    insightOrSpark: text("insight_or_spark").notNull(),

    // Process: What was done - learning, changing, applying, adapting
    // Example: "Diseñé mi propia ruta. Aprendí por mi cuenta, construí un portafolio..."
    process: text("process").notNull(),

    // Result or transformation: The outcome and transformation (both professional and mental)
    // Example: "Hoy tengo una carrera sólida, con más de 10 años de experiencia..."
    resultOrTransformation: text("result_or_transformation").notNull(),

    // Shared beliefs: What you and your audience feel and seek together
    // Example: "Creo que hay miles de desarrolladores en LATAM con talento brutal..."
    sharedBeliefs: text("shared_beliefs").notNull(),

    // Current vision or personal mission: Your current vision and personal mission
    // Example: "Quiero ayudar a los desarrolladores en LATAM a reconocerse como estrategas..."
    currentVisionOrPersonalMission: text("current_vision_or_personal_mission").notNull(),

    // Social proof or validation: Projects, impact, community, results that validate your story
    // Example: "He formado parte de equipos técnicos de alto impacto, construido productos usados globalmente..."
    socialProofOrValidation: text("social_proof_or_validation").notNull(),

    // Call to action: Follow-up, connection, invitation to grow together
    // Example: "Si alguna vez pensaste que ibas tarde, que no tienes lo que se necesita..."
    callToAction: text("call_to_action").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow(),
    isArchived: boolean("is_archived").notNull().default(false),
});

// TypeScript types derived from schema
export type PersonalStory = typeof personalStories.$inferSelect;
export type NewPersonalStory = typeof personalStories.$inferInsert;

