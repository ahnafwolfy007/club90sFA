const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function run() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  console.log('🔎 Looking for migrations in', migrationsDir);

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found. Nothing to do.');
    process.exit(0);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No .sql migration files found.');
    process.exit(0);
  }

  const client = await pool.connect();
  try {
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      console.log(`\n➡️  Applying ${file} ...`);
      const sql = fs.readFileSync(full, 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed ${file}:`, err.message);
        process.exit(1);
      }
    }
    console.log('\n🎉 All migrations applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});
