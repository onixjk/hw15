import { pool } from "./db";

async function init() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT projects_status_check CHECK (status IN ('todo','in_progress','done'))
    );
  `);
    console.log("✅ Таблица projects готова");
    await pool.end();
}
init();