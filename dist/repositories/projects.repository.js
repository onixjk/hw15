"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = listProjects;
exports.createProject = createProject;
exports.getProjectById = getProjectById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
// src/repositories/projects.repository.ts
const db_1 = require("../db");
/** Список: весь или отфильтрованный по подстроке name (ILIKE). */
async function listProjects(filterByName = {}, filterByStatus) {
    const { name } = filterByName;
    const { status } = filterByStatus;
    if (name && status) {
        const { rows } = await db_1.pool.query(`SELECT *
             FROM projects
             WHERE name ILIKE $1
               AND status = $2
             ORDER BY id DESC`, [`%${name}%`, status]);
        return rows;
    }
    else if (name) {
        const { rows } = await db_1.pool.query(`SELECT *
             FROM projects
             WHERE name ILIKE $1
             ORDER BY id DESC`, [`%${name}%`]);
        return rows;
    }
    else if (status) {
        const { rows } = await db_1.pool.query(`SELECT *
             FROM projects
             WHERE status = $1
             ORDER BY id DESC`, [status]);
        return rows;
    }
    else {
        const { rows } = await db_1.pool.query(`SELECT *
             FROM projects
             ORDER BY id DESC`);
        return rows;
    }
}
/**
 * Создание проекта.
 * COALESCE подставляет значения по умолчанию, если поля не пришли:
 *  - description → '' (пустая строка)
 *  - status → 'todo'
 * Возвращаем свежевставленную строку через RETURNING.
 */
async function createProject(data) {
    const { rows } = await db_1.pool.query(`INSERT INTO projects (name, description, status)
         VALUES ($1, COALESCE($2, ''), COALESCE($3, 'todo')) RETURNING id, name, description, status, created_at`, [data.name, data.description ?? null, data.status ?? null]);
    return rows[0];
}
/** Получить один проект по id. Если нет — вернём null. */
async function getProjectById(id) {
    const { rows } = await db_1.pool.query(`SELECT *
         FROM projects
         WHERE id = $1`, [id]);
    return rows[0] ?? null;
}
/**
 * Обновление проекта через PUT (полная замена).
 * Если строка не найдена (0 rows) — вернём null.
 */
async function updateProject(id, data) {
    const { rows } = await db_1.pool.query(`UPDATE projects
         SET name        = $2,
             description = $3,
             status      = $4
         WHERE id = $1 RETURNING *`, [id, data.name, data.description, data.status]);
    return rows[0] ?? null;
}
/** Удаление по id. Возвращает true, если удалили ровно одну строку. */
async function deleteProject(id) {
    const res = await db_1.pool.query(`DELETE
                                  FROM projects
                                  WHERE id = $1`, [id]);
    return res.rowCount === 1;
}
//# sourceMappingURL=projects.repository.js.map