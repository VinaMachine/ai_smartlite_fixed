import mysql from 'mysql2/promise';
import { createClient } from 'redis';
import { config } from './config';

export class DatabaseHelper {
  private connection?: mysql.Connection;

  async connect() {
    this.connection = await mysql.createConnection({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
    });
  }

  async query(sql: string, params?: any[]) {
    if (!this.connection) await this.connect();
    return this.connection!.execute(sql, params);
  }

  async cleanup(tables: string[]) {
    if (!this.connection) await this.connect();
    await this.connection!.execute('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tables) {
      await this.connection!.execute(`TRUNCATE TABLE ${table}`);
    }
    await this.connection!.execute('SET FOREIGN_KEY_CHECKS = 1');
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = undefined;
    }
  }
}

export class RedisHelper {
  private client?: ReturnType<typeof createClient>;

  async connect() {
    this.client = createClient({ url: config.REDIS_URL });
    await this.client.connect();
  }

  async flushAll() {
    if (!this.client) await this.connect();
    await this.client!.flushAll();
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      this.client = undefined;
    }
  }
}

export const db = new DatabaseHelper();
export const redis = new RedisHelper();
