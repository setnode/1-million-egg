import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Initialize postgres client
// In serverless, we generally avoid connection pooling inside the lambda if PgBouncer isn't used,
// but for Postgres.js standard connection pool:
const client = connectionString ? postgres(connectionString, { max: 5 }) : null;

export const db = client ? drizzle(client, { schema }) : null;
