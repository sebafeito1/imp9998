// ═══════════════════════════════════════════════════════════════
//  Confidence Scorer — Score híbrido de confianza
//  No depende solo del juicio del modelo.
// ═══════════════════════════════════════════════════════════════

import type { TechnicalAttribute, NCMCandidate, ConfidenceScore } from "../types.js";

/**
 * Calcula un score de confianza híbrido basado en:
 * 1. Ratio de atributos críticos confirmados vs desconocidos
 * 2. Dispersión de candidatos (1 = bueno, 4 = malo)
 * 3. Conflictos con notas de exclusión
 * 4. Match entre nombre comercial y naturaleza real
 */
export function calculateConfidence(
  attributes: TechnicalAttribute[],
  candidates: NCMCandidate[],
  hasExclusionConflicts: boolean,
  nameNatureMismatch: boolean,
): ConfidenceScore {

  // 1. Ratio atributos críticos confirmados
  const criticalAttrs = attributes.filter(a => a.classification_impact === "critical");
  const confirmedCritical = criticalAttrs.filter(a => a.status === "confirmed");
  const confirmed_attrs_ratio = criticalAttrs.length === 0
    ? 100
    : Math.round((confirmedCritical.length / criticalAttrs.length) * 100);

  // 2. Dispersión de candidatos
  // 1 candidato con alta confianza = 100
  // 4 candidatos todos con baja confianza = 0
  let candidate_dispersion: number;
  if (candidates.length === 0) {
    candidate_dispersion = 0;
  } else if (candidates.length === 1) {
    candidate_dispersion = Math.min(candidates[0].confidence, 100);
  } else {
    // Penalizar por cantidad de candidatos y la brecha entre el primero y el resto
    const top = candidates[0].confidence;
    const avg_rest = candidates.slice(1).reduce((s, c) => s + c.confidence, 0) / (candidates.length - 1);
    const gap = top - avg_rest; // Mayor gap = más certeza en el primero
    candidate_dispersion = Math.max(0, Math.min(100,
      100 - (candidates.length - 1) * 15 + gap * 0.5
    ));
  }

  // 3. Conflictos con notas de exclusión
  const exclusion_conflicts = hasExclusionConflicts ? 0 : 100;

  // 4. Nombre comercial vs naturaleza real
  // Si el nombre puede engañar (ej: "termo" parece Cap 09 pero es Cap 96)
  const name_vs_nature_match = nameNatureMismatch ? 30 : 100;

  // Overall: promedio ponderado
  const overall = Math.round(
    confirmed_attrs_ratio * 0.35 +
    candidate_dispersion * 0.30 +
    exclusion_conflicts * 0.20 +
    name_vs_nature_match * 0.15
  );

  // Nivel
  let level: ConfidenceScore["level"];
  if (overall >= 80) level = "high";
  else if (overall >= 55) level = "medium";
  else if (overall >= 30) level = "low";
  else level = "insufficient";

  return {
    overall,
    breakdown: {
      confirmed_attrs_ratio,
      candidate_dispersion,
      exclusion_conflicts,
      name_vs_nature_match,
    },
    level,
  };
}
