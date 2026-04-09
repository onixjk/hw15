"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// src/db.ts
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5533/projectsdb"; //порт скорее всего будет 5432 -> исправь если так
exports.pool = new pg_1.Pool({ connectionString });
//# sourceMappingURL=db.js.map