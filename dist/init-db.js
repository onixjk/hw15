"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
async function init() {
    await db_1.pool.query(`
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
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      is_done BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
  `);
    console.log("✅ Таблица tasks готова");
    await db_1.pool.end();
}
init();
//# sourceMappingURL=init-db.js.map