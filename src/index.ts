// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import {
    listProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    ProjectFilter,
    NewProjectInput,
    UpdateProjectInput
} from "./repositories/projects.repository";
import {
    NewTaskInput,
    UpdateTaskInput,
    createTask,
    getTasks,
    updateTask,
    deleteTask
} from "./repositories/tasks.repository";
import {getProjectWithTasksJoin} from "./repositories/project-with-tasks.repository";
import * as http from "node:http";

const app = express();
const port = Number(process.env.PORT) || 3000;

const HTTP = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
} as const;

// Middleware
app.use(express.json());
app.use(cors());

// Пинг
app.get("/", (_req: Request, res: Response) => {
    res.status(HTTP.OK).json({ message: "Projects API is up" });
});

// GET /projects?name=...
app.get("/projects", async (req: Request, res: Response) => {
    const { name, status } = req.query as ProjectFilter;
    const rows = await listProjects({ name, status });
    res.status(HTTP.OK).json(rows);
});

// GET /projects/:id
app.get("/projects/:id", async (req: Request, res: Response) => {
    // req.params.id — это СТРОКА. Сначала явно приводим к числу:
    const idNum = Number(req.params.id);

    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const row = await getProjectById(idNum);
    if (!row) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(row);
});

// GET /projects/:projectId/tasks
app.get("/projects/:projectId/tasks", async (req: Request, res: Response) => {
    const rows = await getTasks();
    res.status(HTTP.OK).json(rows);
});

// GET /projects/:id/with-tasks
app.get("/projects/:id/with-tasks", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);

    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const rows = await getProjectWithTasksJoin(idNum);
    res.status(HTTP.OK).json(rows);
});

// POST /projects   { name, description?, status? }
app.post("/projects", async (req: Request, res: Response) => {

    if (!req.body) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid body" });
        return;
    }

    const { name, description, status } = req.body as NewProjectInput;

    if (!name) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Name is required" });
        return;
    }

    const created = await createProject({
        name,
        description,
        status,
    });
    res.status(HTTP.CREATED).json(created);
});

//POST /projects/:projectId/tasks — создать задачу. Body: { "title": ... }
app.post("/projects/:projectId/tasks", async (req: Request, res: Response) => {

    if (!req.body) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid body" });
        return;
    }

    const { title, is_done } = req.body as NewTaskInput;

    const project_id = Number(req.params.projectId);

    if (!Number.isFinite(project_id) || project_id <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    if (!title) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Title is required" });
        return;
    }

    const created = await createTask({ title, project_id, is_done });
    res.status(HTTP.CREATED).json(created);
})

// PUT /projects/:id   { name, description?, status? }
app.put("/projects/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const { name, description, status } = req.body as UpdateProjectInput;

    if (!name || !description || !status) {
        res.status(HTTP.BAD_REQUEST).json({ error: "name, description, status are required" });
        return;
    }

    const updated = await updateProject(idNum, {
        name: name.trim(),
        description,
        status,
    });
    if (!updated) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(updated); // (можно 204 No Content)
});

// PUT /tasks/:id
app.put("/tasks/:id", async (req: Request, res: Response) => {

    if (!req.body) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid body" });
        return;
    }

    const { title, is_done } = req.body as UpdateTaskInput;

    const idNum = Number(req.params.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }


    if (!title) {
        res.status(HTTP.BAD_REQUEST).json({ error: "title are required" });
        return;
    }

    const updated = await updateTask(idNum, {
        title: title.trim(),
        is_done
    });

    if (!updated) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(updated);
});

// DELETE /projects/:id
app.delete("/projects/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    // Ещё раз: Number(...) → Number.isFinite(...) → проверка > 0
    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const ok = await deleteProject(idNum);
    if (!ok) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.sendStatus(HTTP.NO_CONTENT);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);

    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid task ID" });
        return;
    }

    const ok = await deleteTask(idNum);
    if (!ok) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.sendStatus(HTTP.NO_CONTENT);
});



app.listen(port, () => console.log(`✅ http://localhost:${port}`));