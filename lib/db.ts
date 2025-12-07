import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database(join(process.cwd(), 'debattdome.db'));

// Initialize database schema
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      rating REAL DEFAULT 1000.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS arguments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      claim_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      side TEXT CHECK(side IN ('pro', 'con')) NOT NULL,
      content TEXT NOT NULL,
      source_url TEXT,
      ai_score REAL,
      fallacies TEXT,
      ai_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (claim_id) REFERENCES claims(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      argument_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      value INTEGER CHECK(value IN (-1, 1)) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(argument_id, user_id),
      FOREIGN KEY (argument_id) REFERENCES arguments(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_claims_user ON claims(user_id);
    CREATE INDEX IF NOT EXISTS idx_arguments_claim ON arguments(claim_id);
    CREATE INDEX IF NOT EXISTS idx_votes_argument ON votes(argument_id);
  `);
}

// Initialize on import
initDB();

export default db;
