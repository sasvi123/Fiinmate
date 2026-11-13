import fs from 'fs';
import path from 'path';
import { pool } from './db';

async function initDatabase() {
  console.log(' Starting database table initialization on Aiven MySQL...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');

    // Remove single-line comments (-- ...) and empty lines
    const cleanedSql = sqlScript
      .split('\n')
      .map((line) => (line.trim().startsWith('--') ? '' : line))
      .join('\n');

    // Split statements by semicolon
    const statements = cleanedSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const connection = await pool.getConnection();

    for (const stmt of statements) {
      await connection.query(stmt);
    }

    console.log(' All tables and initial categories created successfully!');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error(' Failed to initialize database tables:', error);
    process.exit(1);
  }
}

initDatabase();

