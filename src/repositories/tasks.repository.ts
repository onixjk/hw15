import {pool} from "../db";

export type TaskRowDb = {
    id: number;
    project_id: number;
    title: string;
    is_done: boolean;
    created_at: Date;
};

export type NewTaskInput = {
    title: string;
    project_id: number;
    is_done?: boolean;
};

export type UpdateTaskInput = {
    title: string;
    is_done: boolean;
};

export async function getTasks(): Promise<TaskRowDb[]> {
    const { rows } = await pool.query<TaskRowDb>(
        `SELECT *
         FROM tasks
         ORDER BY id DESC`
    );
    return rows;
}

export async function createTask(data: NewTaskInput): Promise<TaskRowDb> {
    const {rows} = await pool.query<TaskRowDb>(
        `INSERT INTO tasks (title, project_id, is_done)
         VALUES ($1, $2, COALESCE($3, false)) RETURNING *`,
        [data.title, data.project_id, data.is_done ?? false]
    );
    return rows[0];
}

export async function updateTask(id: number, data: UpdateTaskInput): Promise<TaskRowDb | null> {
    const {rows} = await pool.query<TaskRowDb>(
        `UPDATE tasks
         SET title   = $2,
             is_done = $3
         WHERE id = $1 RETURNING *`,
        [id, data.title, data.is_done ?? false]
    );
    return rows[0] ?? null;
}

export async function deleteTask(id: number): Promise<boolean> {
    const res = await pool.query(`DELETE
                                  FROM tasks
                                  WHERE id = $1`, [id]);
    return res.rowCount === 1;
}