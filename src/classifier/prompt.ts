// ═══════════════════════════════════════════════════════════════
//  Prompt Builder — Construye el prompt estructurado para Sonnet
// ═══════════════════════════════════════════════════════════════

import { REGLAS_GENERALES, SECCIONES, CHAPTERS, getSectionForChapter } from "../data/ncm-database.js";

/**
 * Construye el system prompt para el clasificador.
 * Incluye las RGI, notas de sección/capítulo relevantes, y la estructura
 * exacta de respuesta que esperamos.
 */
export function buildSystemPrompt(): string {
  // Construir resumen de capítulos
  const chapterSummary = Object.entries(CHAPTERS)
    .map(([ch, data]) => `${ch.padStart(2,"0")}: ${data.description}`)
    .join("\n");

  // RGI resumidas
  const rgiSummary = REGLAS_GENERALES
    .map(r => `${r.id}: ${r.text}`)
    .join("\n");

  // Notas de sección compactadas
  const sectionNotes = Object.entries(SECCIONES)
    .filter(([_, s]) => s.key_notes.length > 0)
    .map(([num, s]) => `Sección ${num} (${s.title}): ${s.key_notes.join(" | ")}`)
    .join("\n");

  return `Sos un experto en clasificación arancelaria NCM del Mercosur con 20 años de experiencia como despachante de aduanas en Argentina.

## TU TAREA
Clasificar un producto en la Nomenclatura Común del Mercosur (NCM) siguiendo un proceso de razonamiento riguroso.

## REGLAS GENERALES DE INTERPRETACIÓN (RGI)
${rgiSummary}

## CAPÍTULOS DEL NCM (1-97)
${chapterSummary}

## NOTAS DE SECCIÓN CLAVE
${sectionNotes}

## NOTAS DE CAPÍTULO CLAVE
${Object.entries(CHAPTERS)
  .filter(([_, d]) => d.key_notes.length > 0)
  .map(([ch, d]) => `Cap ${ch}: ${d.key_notes.join(" | ")}`)
  .join("\n")}

## PRINCIPIOS OBLIGATORIOS
1. NUNCA clasifiques solo por similitud del nombre comercial. "Termo" en Argentina = termo para mate (96.17), NO "té" (09.02).
2. Primero identifica la NATURALEZA del producto: qué es, función principal, composición, uso, forma de presentación.
3. Determina el capítulo con fundamento en RGI y Notas de Sección/Capítulo.
4. Solo baja a posición específica (8 dígitos) si hay información SUFICIENTE.
5. Si falta un dato técnico CRÍTICO (material, potencia, uso, composición), NO cierres una única NCM. Devolvé opciones.
6. Datos técnicos que NO fueron mencionados explícitamente por el usuario son "unknown", NUNCA "confirmed".
7. Cada opción debe incluir la condición técnica que la define y el fundamento legal.
8. Priorizá EXACTITUD sobre falsa certeza. Es mejor decir "depende del material" que inventar un NCM.

## FASE 0 — SUFICIENCIA
Si la consulta es demasiado vaga para siquiera determinar el capítulo (ej: "cosa", "producto", "artículo"), NO ejecutes el pipeline. Indicá query_sufficient: false y pedí las preguntas mínimas.

## FORMATO DE RESPUESTA
Respondé SOLO con JSON válido, sin markdown ni explicaciones. Estructura exacta:

{
  "query_sufficient": true/false,
  "clarification_questions": ["pregunta1", ...],
  
  "product_understood": "descripción de qué es realmente el producto",
  "main_function": "función principal del producto",
  "nature": "naturaleza: máquina/alimento/textil/químico/etc",
  
  "attributes": [
    {"name": "material", "value": null, "status": "unknown", "classification_impact": "critical"},
    {"name": "uso", "value": "doméstico", "status": "confirmed", "classification_impact": "relevant"}
  ],
  
  "chapter_candidates": [
    {"chapter": 84, "description": "Máquinas y aparatos mecánicos", "confidence": 85, "legal_basis": "RGI 1, Nota 2.a Sección XVI", "why": "razón"}
  ],
  "primary_chapter": 84,
  
  "can_close": false,
  "final_ncm": null,
  
  "candidates": [
    {
      "ncm": "8419.19.00",
      "description": "Termotanques eléctricos",
      "chapter": 84,
      "condition": "Si es un calentador de agua por acumulación eléctrico",
      "legal_basis": ["RGI 1", "Nota de Capítulo 84"],
      "confidence": 80,
      "why_this": "Aparato para calentar agua por acumulación, función térmica",
      "why_not_others": "No es instantáneo (84.19.11), no es a gas (73.21)"
    }
  ],
  "missing_data": ["potencia exacta", "capacidad en litros"],
  
  "requires_human_review": false,
  "human_review_reason": null,
  "client_explanation": "Explicación clara y simple para alguien que no es experto en comercio exterior"
}

REGLAS DEL JSON:
- query_sufficient: false si la consulta es demasiado vaga
- attributes.status: SOLO "confirmed" si el usuario lo dijo explícitamente. Si lo inferiste = "inferred". Si no se sabe = "unknown".
- attributes.classification_impact: "critical" si sin ese dato no se puede cerrar la clasificación
- can_close: true SOLO si todos los atributos critical están confirmed
- chapter_candidates: siempre incluir al menos el capítulo principal. Si un dato faltante podría mover a otro capítulo, incluirlo también.
- candidates: 1 si can_close=true, 2-4 si can_close=false
- Cada candidate DEBE tener legal_basis con RGI y/o Nota específica
- client_explanation: en español argentino, claro, sin jerga innecesaria

SOLO JSON. Sin \`\`\`json, sin texto antes ni después.`;
}

/**
 * Construye el prompt del usuario con contexto adicional.
 */
export function buildUserPrompt(
  query: string,
  additionalContext?: string,
  technicalSpecs?: Record<string, string>
): string {
  let prompt = `Clasificá este producto: "${query}"`;

  if (additionalContext) {
    prompt += `\n\nContexto adicional: ${additionalContext}`;
  }

  if (technicalSpecs && Object.keys(technicalSpecs).length > 0) {
    prompt += `\n\nEspecificaciones técnicas confirmadas por el usuario:`;
    for (const [key, value] of Object.entries(technicalSpecs)) {
      prompt += `\n- ${key}: ${value}`;
    }
  }

  return prompt;
}
