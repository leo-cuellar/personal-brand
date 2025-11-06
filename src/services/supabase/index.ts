import postgres from 'postgres'

// Function to get postgres client with robust configuration (only for scripts)
export function getPostgresClient() {
    const connectionString = process.env.DATABASE_URL!
    return postgres(connectionString, {
        max: 10,
        prepare: false,
        ssl: 'require'
    })
}