// ═══════════════════════════════════════════════════════════════
//  API Routes — Hono endpoints
// ═══════════════════════════════════════════════════════════════

import { Hono } from "hono";
import { classify, clearCache, cacheStats } from "../classifier/classify.js";
import type { ClassifyRequest } from "../types.js";

const api = new Hono();

/**
 * POST /api/classify
 * 
 * Body:
 * {
 *   "query": "termo eléctrico 50 litros",
 *   "additional_context": "para uso doméstico",        // opcional
 *   "technical_specs": { "potencia": "1500W" }          // opcional
 * }
 */
api.post("/classify", async (c) => {
  const startTime = Date.now();

  let body: ClassifyRequest;
  try {
    body = await c.req.json<ClassifyRequest>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) {
    return c.json({ error: "Field 'query' is required and must be a non-empty string" }, 400);
  }

  if (body.query.trim().length > 500) {
    return c.json({ error: "Query too long (max 500 chars)" }, 400);
  }

  try {
    const result = await classify(body);
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[classify] Error for query "${body.query}":`, message);
    return c.json({
      error: "Classification failed",
      detail: message,
      processing_time_ms: Date.now() - startTime,
    }, 500);
  }
});

/**
 * GET /api/health
 */
api.get("/health", (c) => {
  return c.json({
    status: "ok",
    cache: cacheStats(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/cache/clear
 */
api.post("/cache/clear", (c) => {
  const before = cacheStats().size;
  clearCache();
  return c.json({ cleared: before, current: 0 });
});

export default api;
