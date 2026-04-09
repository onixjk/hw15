// src/db.ts
import { Pool } from "pg";

const connectionString =
    process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5533/projectsdb"; //порт скорее всего будет 5432 -> исправь если так

export const pool = new Pool({ connectionString });