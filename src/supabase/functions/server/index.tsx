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

// --- Unit Plans API ---

app.get("/make-server-825f6f99/units", async (c) => {
  try {
    console.log("Fetching unit plans from database...");
    const units = await kv.getByPrefix("unit:");
    console.log(`Retrieved ${units.length} unit plans`);
    return c.json({ units: units.map((u) => u.value) });
  } catch (e) {
    console.error("Error fetching units:", e);
    return c.json({ error: "Failed to fetch units" }, 500);
  }
});

app.post("/make-server-825f6f99/units", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const unit = { ...body, id };
    console.log("Saving unit plan:", unit);
    await kv.set(`unit:${id}`, unit);
    console.log("Unit plan saved successfully:", id);
    return c.json(unit);
  } catch (e) {
    console.error("Error saving unit:", e);
    return c.json({ error: "Failed to save unit" }, 500);
  }
});

app.put("/make-server-825f6f99/units/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const unit = { ...body, id };
    console.log("Updating unit plan:", id);
    await kv.set(`unit:${id}`, unit);
    console.log("Unit plan updated successfully:", id);
    return c.json(unit);
  } catch (e) {
    console.error("Error updating unit:", e);
    return c.json({ error: "Failed to update unit" }, 500);
  }
});

app.delete("/make-server-825f6f99/units/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log("Deleting unit plan:", id);
    await kv.del(`unit:${id}`);
    console.log("Unit plan deleted successfully:", id);
    return c.json({ success: true });
  } catch (e) {
    console.error("Error deleting unit:", e);
    return c.json({ error: "Failed to delete unit" }, 500);
  }
});

// --- PDF to Unit Plan API ---

app.post("/make-server-825f6f99/generate-unit-from-pdf", async (c) => {
  try {
    const body = await c.req.json();
    const { pdfData, fileName, subject, gradeLevel, startDate, endDate } = body;

    if (!pdfData || !subject || !gradeLevel) {
      return c.json({ error: "Missing required fields: pdfData, subject, gradeLevel" }, 400);
    }

    console.log(`Processing PDF: ${fileName} for ${subject} - ${gradeLevel}`);

    // Decode base64 PDF
    const pdfBuffer = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0));
    
    // Extract text from PDF using pdf-parse
    const pdfParse = await import("npm:pdf-parse@1.1.1");
    const pdfContent = await pdfParse.default(pdfBuffer);
    const extractedText = pdfContent.text;

    console.log(`Extracted ${extractedText.length} characters from PDF`);

    if (extractedText.length < 100) {
      return c.json({ error: "PDF appears to be empty or text could not be extracted" }, 400);
    }

    // Call OpenAI to analyze the PDF content
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not found in environment");
      return c.json({ error: "AI service not configured. Please add your OpenAI API key." }, 500);
    }

    const prompt = `You are an expert curriculum designer and education specialist. Analyze the following curriculum document and create a comprehensive unit plan.

Subject: ${subject}
Grade Level: ${gradeLevel}

Document Content:
${extractedText.slice(0, 15000)} ${extractedText.length > 15000 ? '...(truncated)' : ''}

Create a detailed unit plan with the following structure:

1. Extract or create a clear unit title
2. Write a comprehensive description of the unit's focus and goals
3. Identify 3-5 relevant educational standards (provide code and description)
4. Create 5-8 detailed lessons, each with:
   - Title
   - 3-4 learning objectives
   - Detailed activities and procedures (step-by-step)
   - Materials list
   - Assessment methods
   - Duration (in minutes)
   - 2-3 resources (worksheets, quizzes, or texts)

Respond ONLY with valid JSON in this exact format:
{
  "title": "Unit Title",
  "description": "Comprehensive unit description",
  "standards": [
    {
      "id": "std-1",
      "code": "STANDARD.CODE",
      "description": "Standard description",
      "subject": "${subject}",
      "gradeLevel": "${gradeLevel}"
    }
  ],
  "lessons": [
    {
      "id": "lesson-1",
      "title": "Lesson Title",
      "objectives": ["Objective 1", "Objective 2", "Objective 3"],
      "activities": "Detailed step-by-step activities",
      "materials": ["Material 1", "Material 2"],
      "assessment": "Assessment description",
      "duration": "60 minutes",
      "notes": "",
      "resources": [
        {
          "id": "res-1",
          "type": "worksheet",
          "title": "Resource Title",
          "description": "Resource description",
          "estimatedTime": "20 minutes",
          "alignedObjectives": ["Objective 1"]
        }
      ]
    }
  ]
}`;

    console.log("Sending request to OpenAI...");
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert curriculum designer. Always respond with valid JSON only, no markdown or additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return c.json({ error: `AI service error: ${errorData.error?.message || 'Unknown error'}` }, 500);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;
    
    console.log("OpenAI response received");

    // Parse the JSON response
    let unitPlan;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      unitPlan = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return c.json({ error: "Failed to parse AI response. Please try again." }, 500);
    }

    console.log("Unit plan successfully generated from PDF");
    return c.json(unitPlan);

  } catch (e) {
    console.error("Error generating unit from PDF:", e);
    return c.json({ 
      error: `Failed to generate unit from PDF: ${e.message}`,
      details: e.toString()
    }, 500);
  }
});

// --- Lessons API ---

app.get("/make-server-825f6f99/lessons", async (c) => {
  try {
    console.log("Fetching lessons from database...");
    const lessons = await kv.getByPrefix("lesson:");
    console.log(`Retrieved ${lessons.length} lessons`);
    // value is the stored JSON object
    return c.json(lessons.map((l) => l.value));
  } catch (e) {
    console.error("Error fetching lessons:", e);
    return c.json({ error: "Failed to fetch lessons" }, 500);
  }
});

app.post("/make-server-825f6f99/lessons", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id || crypto.randomUUID();
    const lesson = { ...body, id };
    console.log("Saving lesson:", lesson);
    await kv.set(`lesson:${id}`, lesson);
    console.log("Lesson saved successfully:", id);
    return c.json(lesson);
  } catch (e) {
    console.error("Error saving lesson:", e);
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

// Start the server
Deno.serve(app.fetch);