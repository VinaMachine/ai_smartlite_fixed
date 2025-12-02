import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, closeConnection, testConnection } from './db';

async function runMigrations() {
  console.log('Starting database migration...');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

runMigrations();
