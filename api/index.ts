// Vercel Serverless Function — Edge Runtime
// Hono app exported as Vercel handler

import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "../src/classifier/prompt.ts";
import { calculateConfidence } from "../src/classifier/confidence.ts";
import { CHAPTERS } from "../src/data/ncm-database.ts";

export const config = { runtime: "nodejs" };

// ── Inline classify (Vercel bundles everything into one function) ──

const cache = new Map<string, any>();

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function norm(q: string) {
  return q.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function classify(query: string, additionalContext?: string, technicalSpecs?: Record<string, string>) {
  const startTime = Date.now();
  const cacheKey = norm(query) + "|" + (technicalSpecs ? JSON.stringify(technicalSpecs) : "");

  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, processing_time_ms: Date.now() - startTime };

  const client = getClient();
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(query, additionalContext, technicalSpecs);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");

  const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Build confidence
  const attributes = (parsed.attributes || []).map((a: any) => ({
    name: a.name || "",
    value: a.value ?? null,
    status: a.status || "unknown",
    source: a.source || "model_inference",
    classification_impact: a.classification_impact || "relevant",
  }));

  const candidates = (parsed.candidates || []).map((c: any) => ({
    ncm: c.ncm || "????",
    description: c.description || "",
    chapter: c.chapter || 0,
    condition: c.condition || "",
    legal_basis: Array.isArray(c.legal_basis) ? c.legal_basis : [c.legal_basis || ""],
    confidence: Math.max(0, Math.min(100, c.confidence || 0)),
    why_this: c.why_this || "",
    why_not_others: c.why_not_others || "",
  }));

  const hasExclusion = candidates.some((c: any) =>
    (c.why_not_others || "").toLowerCase().includes("exclu")
  );

  const confidence_score = calculateConfidence(attributes, candidates, hasExclusion, false);

  const unknown_critical = attributes.filter(
    (a: any) => a.classification_impact === "critical" && a.status === "unknown"
  ).length;

  const result = {
    query_sufficient: parsed.query_sufficient !== false,
    clarification_questions: parsed.clarification_questions || undefined,
    product_understood: parsed.product_understood || "",
    main_function: parsed.main_function || "",
    nature: parsed.nature || "",
    attributes,
    confirmed_count: attributes.filter((a: any) => a.status === "confirmed").length,
    unknown_critical_count: unknown_critical,
    chapter_candidates: parsed.chapter_candidates || [],
    primary_chapter: parsed.primary_chapter || 0,
    can_close: parsed.can_close === true && unknown_critical === 0,
    final_ncm: parsed.can_close === true && unknown_critical === 0
      ? parsed.final_ncm || candidates[0]?.ncm : undefined,
    candidates,
    missing_data: parsed.missing_data || [],
    confidence_score,
    requires_human_review: confidence_score.level === "insufficient" || confidence_score.level === "low",
    client_explanation: parsed.client_explanation || "",
    processing_time_ms: Date.now() - startTime,
  };

  cache.set(cacheKey, result);
  return result;
}

// ── Hono App ──

const app = new Hono().basePath("/api");
app.use("*", cors());

app.post("/classify", async (c) => {
  let body: any;
  try { body = await c.req.json(); } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  if (!body.query?.trim()) {
    return c.json({ error: "'query' is required" }, 400);
  }
  try {
    const result = await classify(body.query, body.additional_context, body.technical_specs);
    return c.json(result);
  } catch (error) {
    return c.json({ error: "Classification failed", detail: String(error) }, 500);
  }
});

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/", (c) => c.json({
  name: "ncm-classifier",
  endpoints: { classify: "POST /api/classify", health: "GET /api/health" },
}));

export default handle(app);
