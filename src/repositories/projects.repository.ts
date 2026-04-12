// src/repositories/projects.repository.ts
import {pool} from "../db";

/**
 * Строка из таблицы `projects` в том виде, как её возвращает драйвер `pg` по умолчанию.
 * Ожидаем именно такой тип объекта.
 * Важно: Колонка `created_at` имеет тип TIMESTAMPTZ, и `pg` парсит её в JS `Date`.
 * Поэтому типизируем как Date
 */
export type ProjectRowDb = {
    id: number;
    name: string;
    description: string;
    status: "todo" | "in_progress" | "done";
    created_at: Date;
};

/**
 * Тело запроса при создании проекта (payload клиента).
 * description/status можно не передавать — мы подставим запасные значения
 * через COALESCE (см. INSERT ниже).
 */
export type NewProjectInput = {
    name: string;
    description?: string;
    status?: "todo" | "in_progress" | "done";
};

/**
 * Тело запроса при обновлении проекта через PUT.
 * Для «настоящего PUT» ожидаем ПОЛНУЮ замену ресурса — все поля обязательны.
 */
export type UpdateProjectInput = {
    name: string;
    description: string;
    status: "todo" | "in_progress" | "done";
};

/**
 * Фильтр списка через query-параметры.
 * name — подстрочный (ILIKE) поиск по названию, регистронезависимо.
 */
export type ProjectFilter = {
    name?: string;
    status?: "todo" | "in_progress" | "done";
};

/** Список: весь или отфильтрованный по подстроке name (ILIKE). */
// export async function listProjects(filter: ProjectFilter = {}): Promise<ProjectRowDb[]> {
//     const {name, status} = filter;
//
//     const query = `SELECT *
//                    FROM projects
//                    ORDER BY id DESC`;
//     const nameStatusQuery = `SELECT *
//                              FROM projects
//                              WHERE name ILIKE $1
//                                AND status = $2
//                              ORDER BY id DESC`;
//     const nameQuery = `SELECT *
//                        FROM projects
//                        WHERE name ILIKE $1
//                        ORDER BY id DESC`;
//     const statusQuery = `SELECT *
//                          FROM projects
//                          WHERE status = $1
//                          ORDER BY id DESC`;
//
//     if (name && status) {
//         const {rows} = await pool.query<ProjectRowDb>(nameStatusQuery, [`%${name}%`, status]);
//         return rows;
//     } else if (name) {
//         const {rows} = await pool.query<ProjectRowDb>(nameQuery, [`%${name}%`]);
//         return rows;
//     } else if (status) {
//         const {rows} = await pool.query<ProjectRowDb>(statusQuery, [status]);
//         return rows;
//     } else {
//         const {rows} = await pool.query<ProjectRowDb>(query);
//         return rows;
//     }
// }

export async function listProjects(filter: ProjectFilter): Promise<ProjectRowDb[]> {
    const { name, status } = filter;

    const values: string[] = []; // 4, done
    const conditions: string[] = []; // name ILIKE $1, status = $2

    if (name) {
        values.push(`%${name}%`);
        conditions.push(`name ILIKE $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`status = $${values.length}`);
    }

    const whereClause = conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const query = `SELECT *
                   FROM projects ${whereClause}
                   ORDER BY id DESC`;

    const { rows } = await pool.query<ProjectRowDb>(query, values);
    return rows;
}

/**
 * Создание проекта.
 * COALESCE подставляет значения по умолчанию, если поля не пришли:
 *  - description → '' (пустая строка)
 *  - status → 'todo'
 * Возвращаем свежевставленную строку через RETURNING.
 */
export async function createProject(data: NewProjectInput): Promise<ProjectRowDb> {
    const {rows} = await pool.query<ProjectRowDb>(
        `INSERT INTO projects (name, description, status)
         VALUES ($1, COALESCE($2, ''), COALESCE($3, 'todo')) RETURNING id, name, description, status, created_at`,
        [data.name, data.description ?? null, data.status ?? null]
    );
    return rows[0];
}

/** Получить один проект по id. Если нет — вернём null. */
export async function getProjectById(id: number): Promise<ProjectRowDb | null> {
    const {rows} = await pool.query<ProjectRowDb>(
        `SELECT *
         FROM projects
         WHERE id = $1`,
        [id]
    );
    return rows[0] ?? null;
}

/**
 * Обновление проекта через PUT (полная замена).
 * Если строка не найдена (0 rows) — вернём null.
 */
export async function updateProject(id: number, data: UpdateProjectInput): Promise<ProjectRowDb | null> {
    const {rows} = await pool.query<ProjectRowDb>(
        `UPDATE projects
         SET name        = $2,
             description = $3,
             status      = $4
         WHERE id = $1 RETURNING *`,
        [id, data.name, data.description, data.status]
    );
    return rows[0] ?? null;
}

/** Удаление по id. Возвращает true, если удалили ровно одну строку. */
export async function deleteProject(id: number): Promise<boolean> {
    const res = await pool.query(`DELETE
                                  FROM projects
                                  WHERE id = $1`, [id]);
    return res.rowCount === 1;
}