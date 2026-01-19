import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// PostgreSQL direct connection
export const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Supabase client (optional, if using Supabase instead of raw PostgreSQL)
export const supabase = config.database.supabaseUrl && config.database.supabaseKey
  ? createClient(config.database.supabaseUrl, config.database.supabaseKey)
  : null;

// Helper to run migrations
export async function runMigration(sql: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper query function with better error handling
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res.rows;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('Database connection pool closed');
}
