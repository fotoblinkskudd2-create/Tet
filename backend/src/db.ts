import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'bergenbudget.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}

export function initializeDatabase(): void {
  const database = getDb();

  database.exec(`
    -- Brukere
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Kontoer (bankkontoer)
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('checking', 'savings', 'credit', 'bsu')),
      bank_name TEXT,
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'NOK',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);

    -- Kategorier
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT DEFAULT '📁',
      is_tax_relevant INTEGER NOT NULL DEFAULT 0,
      tax_code TEXT,
      parent_id TEXT REFERENCES categories(id),
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

    -- Transaksjoner
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES categories(id),
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer')),
      receipt_path TEXT,
      is_split INTEGER NOT NULL DEFAULT 0,
      parent_transaction_id TEXT REFERENCES transactions(id),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

    -- Etiketter (tags)
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_user_name ON tags(user_id, name);

    -- Transaksjon-etiketter (junction)
    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (transaction_id, tag_id)
    );

    -- Faste transaksjoner (recurring)
    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      category_id TEXT REFERENCES categories(id),
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
      next_date TEXT NOT NULL,
      end_date TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_next ON recurring_transactions(next_date);

    -- Budsjetter
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, category_id, year, month)
    );
    CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, year, month);
  `);

  // Seed default categories if empty
  const catCount = database.prepare('SELECT COUNT(*) as cnt FROM categories WHERE user_id IS NULL').get() as any;
  if (catCount.cnt === 0) {
    seedDefaultCategories(database);
  }
}

function seedDefaultCategories(database: Database.Database): void {
  const insert = database.prepare(
    'INSERT INTO categories (id, user_id, name, type, icon, is_tax_relevant, tax_code, sort_order) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)'
  );

  const categories = [
    // Inntekt
    ['cat_lonn', 'Lønn', 'income', '💰', 1, 'skattetrekk', 1],
    ['cat_feriepenger', 'Feriepenger', 'income', '🏖️', 1, 'feriepenger', 2],
    ['cat_annen_inntekt', 'Annen inntekt', 'income', '📈', 0, null, 3],
    // Utgifter
    ['cat_husleie', 'Husleie/Bolig', 'expense', '🏠', 0, null, 10],
    ['cat_strom', 'Strøm', 'expense', '⚡', 0, null, 11],
    ['cat_mat', 'Mat og dagligvarer', 'expense', '🛒', 0, null, 12],
    ['cat_transport', 'Transport/Bybanen', 'expense', '🚋', 0, null, 13],
    ['cat_helse', 'Helse', 'expense', '🏥', 1, 'fradrag_helse', 14],
    ['cat_forsikring', 'Forsikring', 'expense', '🛡️', 0, null, 15],
    ['cat_telefon', 'Telefon/Internett', 'expense', '📱', 0, null, 16],
    ['cat_abonnement', 'Abonnementer', 'expense', '📺', 0, null, 17],
    ['cat_klær', 'Klær', 'expense', '👕', 0, null, 18],
    ['cat_underholdning', 'Underholdning', 'expense', '🎭', 0, null, 19],
    ['cat_restaurant', 'Restaurant/Utemat', 'expense', '🍽️', 0, null, 20],
    ['cat_trening', 'Trening/Sats', 'expense', '💪', 0, null, 21],
    ['cat_bsu', 'BSU sparing', 'expense', '🏦', 1, 'bsu_fradrag', 22],
    ['cat_fagforening', 'Fagforeningskontingent', 'expense', '🤝', 1, 'fagforening_fradrag', 23],
    ['cat_reise', 'Reise', 'expense', '✈️', 0, null, 24],
    ['cat_gave', 'Gaver', 'expense', '🎁', 0, null, 25],
    ['cat_annet', 'Annet', 'expense', '📦', 0, null, 99],
  ];

  const insertMany = database.transaction(() => {
    for (const [id, name, type, icon, taxRelevant, taxCode, sort] of categories) {
      insert.run(id, name, type, icon, taxRelevant, taxCode, sort);
    }
  });
  insertMany();
}
