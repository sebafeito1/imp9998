// ═══════════════════════════════════════════════════════════════
//  ncm-classifier — Entry Point
// ═══════════════════════════════════════════════════════════════

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import api from "./api/routes.ts";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Routes
app.route("/api", api);

// Root
app.get("/", (c) => {
  return c.json({
    name: "ncm-classifier",
    version: "0.1.0",
    description: "Sistema de clasificación arancelaria NCM con IA",
    endpoints: {
      classify: "POST /api/classify",
      health: "GET /api/health",
      cache_clear: "POST /api/cache/clear",
    },
    usage: {
      minimal: 'curl -X POST http://localhost:3000/api/classify -H "Content-Type: application/json" -d \'{"query":"hidrolavadora"}\'',
      with_specs: 'curl -X POST http://localhost:3000/api/classify -H "Content-Type: application/json" -d \'{"query":"generador","technical_specs":{"combustible":"diesel","potencia":"50kVA"}}\'',
    },
  });
});

// Start
const port = parseInt(process.env.PORT || "3000");
console.log(`\n🏛️  NCM Classifier v0.1.0`);
console.log(`📡  http://localhost:${port}`);
console.log(`🔍  POST /api/classify { "query": "tu producto" }`);
console.log(`❤️  GET  /api/health\n`);

serve({ fetch: app.fetch, port });
