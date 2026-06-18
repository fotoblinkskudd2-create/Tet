require('dotenv/config');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }

  await pool.end();
  console.log('Migrations complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
