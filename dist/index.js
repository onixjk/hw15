"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const projects_repository_1 = require("./repositories/projects.repository");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
const HTTP = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
};
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Пинг
app.get("/", (_req, res) => {
    res.status(HTTP.OK).json({ message: "Projects API is up" });
});
// GET /projects?name=...
app.get("/projects", async (req, res) => {
    const { name, status } = req.query;
    const rows = await (0, projects_repository_1.listProjects)({ name }, { status });
    res.status(HTTP.OK).json(rows);
});
// GET /projects/:id
app.get("/projects/:id", async (req, res) => {
    // req.params.id — это СТРОКА. Сначала явно приводим к числу:
    const idNum = Number(req.params.id);
    // Number.isFinite проверяет «настоящее» конечное число (не NaN/Infinity).
    // ВАЖНО: глобальный isFinite("123") → true (неявно приводит к числу),
    // а Number.isFinite("123") → false (строго, без приведения).
    // Поэтому делаем два шага: Number(...) → Number.isFinite(idNum)
    // Также это гораздо надежнее чем проверка с помощью IsNaN
    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const row = await (0, projects_repository_1.getProjectById)(idNum);
    if (!row) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(row);
});
// POST /projects   { name, description?, status? }
app.post("/projects", async (req, res) => {
    const { name, description, status } = req.body;
    if (!name) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Name is required" });
        return;
    }
    const created = await (0, projects_repository_1.createProject)({
        name,
        description,
        status,
    });
    res.status(HTTP.CREATED).json(created);
});
// PUT /projects/:id   { name, description?, status? }
app.put("/projects/:id", async (req, res) => {
    const idNum = Number(req.params.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const { name, description, status } = req.body;
    if (!name || !description || !status) {
        res.status(HTTP.BAD_REQUEST).json({ error: "name, description, status are required" });
        return;
    }
    const updated = await (0, projects_repository_1.updateProject)(idNum, {
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
// DELETE /projects/:id
app.delete("/projects/:id", async (req, res) => {
    const idNum = Number(req.params.id);
    // Ещё раз: Number(...) → Number.isFinite(...) → проверка > 0
    if (!Number.isFinite(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const ok = await (0, projects_repository_1.deleteProject)(idNum);
    if (!ok) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.sendStatus(HTTP.NO_CONTENT);
});
app.listen(port, () => console.log(`✅ http://localhost:${port}`));
//# sourceMappingURL=index.js.map