import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in server/ or current directory
const envPath = fs.existsSync(path.resolve(__dirname, '../../.env'))
  ? path.resolve(__dirname, '../../.env')
  : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Check for ca.pem or "ca .pem" in root or server directory
let caCert: Buffer | undefined;
const possibleCaPaths = [
  path.resolve(__dirname, '../../../ca.pem'),
  path.resolve(__dirname, '../../../ca .pem'),
  path.resolve(process.cwd(), 'ca.pem'),
  path.resolve(process.cwd(), 'ca .pem'),
];

for (const p of possibleCaPaths) {
  if (fs.existsSync(p)) {
    try {
      caCert = fs.readFileSync(p);
      break;
    } catch {
      // ignore
    }
  }
}

// Create a MySQL connection pool for concurrent queries
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true'
    ? {
        ca: caCert,
        rejectUnauthorized: false,
      }
    : undefined,
});

// Helper function to test database connectivity
export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log(' Successfully connected to Aiven MySQL database.');
    connection.release();
    return true;
  } catch (error) {
    console.error(' Failed to connect to MySQL database:', error);
    return false;
  }
}

