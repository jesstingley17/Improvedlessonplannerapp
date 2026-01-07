import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-825f6f99/health", (c) => {
  return c.json({ status: "ok" });
});

// --- Lessons API ---

app.get("/make-server-825f6f99/lessons", async (c) => {
  try {
    const lessons = await kv.getByPrefix("lesson:");
    // value is the stored JSON object
    return c.json(lessons.map((l) => l.value));
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to fetch lessons" }, 500);
  }
});

app.post("/make-server-825f6f99/lessons", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const lesson = { ...body, id };
    await kv.set(`lesson:${id}`, lesson);
    return c.json(lesson);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to save lesson" }, 500);
  }
});

app.delete("/make-server-825f6f99/lessons/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`lesson:${id}`);
    return c.json({ success: true });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to delete lesson" }, 500);
  }
});

// --- Planner/Schedule API ---

app.get("/make-server-825f6f99/planner", async (c) => {
  try {
    // Returns all schedule items. 
    // In a real app, you'd filter by date range, but KV scan is what we have.
    const items = await kv.getByPrefix("schedule:");
    return c.json(items.map((i) => i.value));
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to fetch schedule" }, 500);
  }
});

app.post("/make-server-825f6f99/planner", async (c) => {
  try {
    const body = await c.req.json();
    // Expected body: { date: "YYYY-MM-DD", periodId: "p1", lessonId: "...", ... }
    if (!body.date || !body.periodId) {
      return c.json({ error: "Missing date or periodId" }, 400);
    }
    const key = `schedule:${body.date}:${body.periodId}`;
    await kv.set(key, body);
    return c.json(body);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to save schedule item" }, 500);
  }
});
