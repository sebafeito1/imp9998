// ═══════════════════════════════════════════════════════════════
//  NCM Classifier — Type Definitions
// ═══════════════════════════════════════════════════════════════

/** Atributo técnico extraído de la consulta */
export interface TechnicalAttribute {
  name: string;           // ej: "material", "potencia", "uso"
  value: string | null;   // null = no especificado
  status: "confirmed" | "inferred" | "unknown";
  source: "user_query" | "technical_doc" | "model_inference";
  classification_impact: "critical" | "relevant" | "minor";
  // Si es critical y status != confirmed, el sistema NO puede cerrar clasificación
}

/** Candidato de clasificación NCM */
export interface NCMCandidate {
  ncm: string;            // 8 dígitos: XXXX.XX.XX
  description: string;    // Descripción oficial de la posición
  chapter: number;
  condition: string;      // "Si el producto es de plástico y uso doméstico"
  legal_basis: string[];  // ["RGI 1", "Nota 2.a Cap 84", ...]
  confidence: number;     // 0-100
  why_this: string;       // Por qué aplica esta posición
  why_not_others: string; // Por qué se diferencia de las otras opciones
}

/** Resultado de la Fase 0: Suficiencia */
export interface SufficiencyResult {
  sufficient: boolean;
  missing_questions?: string[];   // Preguntas obligatorias si es insuficiente
  reason?: string;
}

/** Resultado completo del pipeline de clasificación */
export interface ClassificationResult {
  // Fase 0: Suficiencia
  query_sufficient: boolean;
  clarification_questions?: string[];

  // Fase 1: Entendimiento del producto
  product_understood: string;     // Qué es realmente el producto
  main_function: string;          // Función principal
  nature: string;                 // Naturaleza: máquina, alimento, textil, etc.

  // Fase 2: Atributos técnicos
  attributes: TechnicalAttribute[];
  confirmed_count: number;
  unknown_critical_count: number;

  // Fase 3: Capítulo
  chapter_candidates: {
    chapter: number;
    description: string;
    confidence: number;
    legal_basis: string;
    why: string;
  }[];
  primary_chapter: number;

  // Fase 4: Clasificación específica
  can_close: boolean;             // ¿Se puede cerrar a una única NCM?
  final_ncm?: string;             // Solo si can_close = true

  // Fase 5: Opciones (si can_close = false)
  candidates: NCMCandidate[];
  missing_data: string[];         // Qué datos faltan para cerrar

  // Fase 6: Metadata
  confidence_score: ConfidenceScore;
  requires_human_review: boolean;
  human_review_reason?: string;

  // Explicación para el cliente
  client_explanation: string;

  // Timing
  processing_time_ms: number;
}

/** Score de confianza híbrido */
export interface ConfidenceScore {
  overall: number;                // 0-100
  breakdown: {
    confirmed_attrs_ratio: number;     // % de atributos críticos confirmados
    candidate_dispersion: number;      // 100 si 1 candidato, baja si muchos
    exclusion_conflicts: number;       // Penaliza si hay conflictos con notas
    name_vs_nature_match: number;      // Penaliza si nombre comercial engaña
  };
  level: "high" | "medium" | "low" | "insufficient";
}

/** Entrada del usuario */
export interface ClassifyRequest {
  query: string;                  // "termo eléctrico 50 litros"
  additional_context?: string;    // Info extra opcional
  technical_specs?: Record<string, string>; // Specs confirmadas por el usuario
}

/** Posición NCM en la base de datos */
export interface NCMPosition {
  ncm: string;
  description: string;
  chapter: number;
  heading: string;        // 4 dígitos
  subheading: string;     // 6 dígitos
  di: number;             // Derecho de importación %
  iva: number;            // 10.5 o 21
  flag?: string;          // "BK" | "BIT" | ""
  notes?: string;         // Notas relevantes
}
