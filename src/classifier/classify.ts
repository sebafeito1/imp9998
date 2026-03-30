// ═══════════════════════════════════════════════════════════════
//  Classify — Orquestador principal del pipeline
// ═══════════════════════════════════════════════════════════════

import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.ts";
import { calculateConfidence } from "./confidence.ts";
import { CHAPTERS } from "../data/ncm-database.ts";
import type { ClassifyRequest, ClassificationResult, TechnicalAttribute, NCMCandidate, ConfidenceScore } from "../types.ts";

// Cache en memoria: query normalizada → resultado
const cache = new Map<string, ClassificationResult>();

// Cliente Anthropic (singleton)
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic(); // usa ANTHROPIC_API_KEY del env
  }
  return client;
}

/**
 * Pipeline principal de clasificación.
 * 
 * Flujo:
 * 1. Cache hit → instantáneo
 * 2. Sonnet call con chain-of-thought estructurado
 * 3. Parse JSON → enriquecer con confidence score
 * 4. Cache result → return
 */
export async function classify(req: ClassifyRequest): Promise<ClassificationResult> {
  const startTime = Date.now();
  const cacheKey = normalizeQuery(req.query, req.technical_specs);

  // 1. Cache hit
  const cached = cache.get(cacheKey);
  if (cached) {
    return { ...cached, processing_time_ms: Date.now() - startTime };
  }

  // 2. Call Sonnet
  const anthropic = getClient();
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(req.query, req.additional_context, req.technical_specs);

  let rawResponse: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    rawResponse = response.content
      .filter(block => block.type === "text")
      .map(block => (block as { type: "text"; text: string }).text)
      .join("");
  } catch (error) {
    throw new Error(`API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 3. Parse JSON
  let parsed: any;
  try {
    // Limpiar posibles artefactos de markdown
    const cleaned = rawResponse
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Failed to parse model response as JSON: ${rawResponse.substring(0, 200)}...`);
  }

  // 4. Construir resultado con confidence scoring híbrido
  const result = buildResult(parsed, startTime);

  // 5. Cache
  cache.set(cacheKey, result);

  return result;
}

/**
 * Construye el ClassificationResult final con confidence scoring.
 */
function buildResult(parsed: any, startTime: number): ClassificationResult {
  // Extraer atributos
  const attributes: TechnicalAttribute[] = (parsed.attributes || []).map((a: any) => ({
    name: a.name || "",
    value: a.value ?? null,
    status: validateStatus(a.status),
    source: a.source || "model_inference",
    classification_impact: validateImpact(a.classification_impact),
  }));

  // Extraer candidatos
  const candidates: NCMCandidate[] = (parsed.candidates || []).map((c: any) => ({
    ncm: c.ncm || "????",
    description: c.description || "",
    chapter: c.chapter || parseInt(c.ncm?.substring(0, 2)) || 0,
    condition: c.condition || "",
    legal_basis: Array.isArray(c.legal_basis) ? c.legal_basis : [c.legal_basis || ""],
    confidence: Math.max(0, Math.min(100, c.confidence || 0)),
    why_this: c.why_this || "",
    why_not_others: c.why_not_others || "",
  }));

  // Verificar si hay conflictos con notas de exclusión
  // (si el modelo mencionó exclusiones en why_not_others)
  const hasExclusionConflicts = candidates.some(c =>
    c.why_not_others.toLowerCase().includes("exclu") ||
    c.why_not_others.toLowerCase().includes("nota") && c.why_not_others.toLowerCase().includes("no comprende")
  );

  // Verificar name-nature mismatch
  const nameNatureMismatch = parsed.product_understood?.toLowerCase() !== parsed.nature?.toLowerCase()
    && parsed.product_understood?.length > 0;

  // Calcular confidence híbrido
  const confidence_score = calculateConfidence(
    attributes,
    candidates,
    hasExclusionConflicts,
    nameNatureMismatch,
  );

  // Determinar si necesita revisión humana
  const requires_human_review = confidence_score.level === "insufficient"
    || confidence_score.level === "low"
    || candidates.length > 3
    || attributes.filter(a => a.classification_impact === "critical" && a.status === "unknown").length > 2;

  // Counts
  const confirmed_count = attributes.filter(a => a.status === "confirmed").length;
  const unknown_critical_count = attributes.filter(a =>
    a.classification_impact === "critical" && a.status === "unknown"
  ).length;

  // Chapter candidates
  const chapter_candidates = (parsed.chapter_candidates || []).map((c: any) => ({
    chapter: c.chapter,
    description: c.description || CHAPTERS[c.chapter as number]?.description || "",
    confidence: c.confidence || 0,
    legal_basis: c.legal_basis || "",
    why: c.why || "",
  }));

  return {
    query_sufficient: parsed.query_sufficient !== false,
    clarification_questions: parsed.clarification_questions || undefined,

    product_understood: parsed.product_understood || "",
    main_function: parsed.main_function || "",
    nature: parsed.nature || "",

    attributes,
    confirmed_count,
    unknown_critical_count,

    chapter_candidates,
    primary_chapter: parsed.primary_chapter || chapter_candidates[0]?.chapter || 0,

    can_close: parsed.can_close === true && unknown_critical_count === 0,
    final_ncm: parsed.can_close === true && unknown_critical_count === 0
      ? parsed.final_ncm || candidates[0]?.ncm
      : undefined,

    candidates,
    missing_data: parsed.missing_data || [],

    confidence_score,
    requires_human_review,
    human_review_reason: requires_human_review
      ? buildReviewReason(confidence_score, unknown_critical_count, candidates.length)
      : undefined,

    client_explanation: parsed.client_explanation || "",

    processing_time_ms: Date.now() - startTime,
  };
}

function buildReviewReason(
  score: ConfidenceScore,
  unknownCritical: number,
  candidateCount: number,
): string {
  const reasons: string[] = [];
  if (score.level === "insufficient") reasons.push("Confianza general insuficiente");
  if (unknownCritical > 2) reasons.push(`${unknownCritical} atributos críticos desconocidos`);
  if (candidateCount > 3) reasons.push(`${candidateCount} candidatos posibles (alta ambigüedad)`);
  if (score.breakdown.exclusion_conflicts < 50) reasons.push("Posible conflicto con notas de exclusión");
  return reasons.join("; ");
}

function validateStatus(s: any): TechnicalAttribute["status"] {
  if (s === "confirmed" || s === "inferred" || s === "unknown") return s;
  return "unknown";
}

function validateImpact(i: any): TechnicalAttribute["classification_impact"] {
  if (i === "critical" || i === "relevant" || i === "minor") return i;
  return "relevant";
}

function normalizeQuery(query: string, specs?: Record<string, string>): string {
  const base = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const specsKey = specs ? JSON.stringify(specs) : "";
  return `${base}|${specsKey}`;
}

/** Limpiar cache (para testing) */
export function clearCache(): void {
  cache.clear();
}

/** Stats del cache */
export function cacheStats(): { size: number } {
  return { size: cache.size };
}
