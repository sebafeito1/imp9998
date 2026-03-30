// ═══════════════════════════════════════════════════════════════
//  Tests — Casos de prueba para el clasificador
// ═══════════════════════════════════════════════════════════════

import { classify, clearCache } from "../src/classifier/classify.js";

interface TestCase {
  name: string;
  query: string;
  specs?: Record<string, string>;
  expect: {
    query_sufficient: boolean;
    primary_chapter?: number;
    can_close?: boolean;
    final_ncm?: string;
    min_candidates?: number;
    max_time_ms?: number;
  };
}

const TESTS: TestCase[] = [
  // ── EXACTOS: productos específicos ──
  {
    name: "Termo eléctrico 50L → debe ser termotanque, NO té",
    query: "termo eléctrico 50 litros",
    expect: {
      query_sufficient: true,
      primary_chapter: 84,
      can_close: true,
      final_ncm: "8419.19.00",
      max_time_ms: 15000,
    },
  },
  {
    name: "Termo stanley → debe ser termo aislante (96.17)",
    query: "termo stanley",
    expect: {
      query_sufficient: true,
      primary_chapter: 96,
      max_time_ms: 15000,
    },
  },
  {
    name: "iPhone → smartphone (8517.13.00)",
    query: "iPhone 15 Pro Max",
    expect: {
      query_sufficient: true,
      primary_chapter: 85,
      can_close: true,
      final_ncm: "8517.13.00",
    },
  },

  // ── AMBIGUOS: deben dar opciones ──
  {
    name: "Generador → debe dar opciones diesel/nafta/eólico",
    query: "generador",
    expect: {
      query_sufficient: true,
      primary_chapter: 85,
      can_close: false,
      min_candidates: 2,
    },
  },
  {
    name: "Válvula → muy ambiguo, múltiples capítulos posibles",
    query: "válvula",
    expect: {
      query_sufficient: true,
      can_close: false,
      min_candidates: 2,
    },
  },
  {
    name: "Cable → debe dar opciones por tipo",
    query: "cable",
    expect: {
      query_sufficient: true,
      can_close: false,
      min_candidates: 2,
    },
  },
  {
    name: "Peine → opciones por material",
    query: "peine",
    expect: {
      query_sufficient: true,
      can_close: false,
      min_candidates: 2,
    },
  },

  // ── CON SPECS: deben cerrar con datos adicionales ──
  {
    name: "Generador diesel 50kVA → debe cerrar en 8502.11",
    query: "generador",
    specs: { combustible: "diesel", potencia: "50kVA" },
    expect: {
      query_sufficient: true,
      primary_chapter: 85,
      can_close: true,
    },
  },

  // ── INSUFICIENTES: deben pedir clarificación ──
  {
    name: "Producto → demasiado vago",
    query: "producto",
    expect: {
      query_sufficient: false,
    },
  },
  {
    name: "Cosa → demasiado vago",
    query: "cosa",
    expect: {
      query_sufficient: false,
    },
  },

  // ── TRICKY: nombres comerciales engañosos ──
  {
    name: "Monopatín eléctrico → 8711.60.00 con DI 20% (CBU)",
    query: "monopatín eléctrico",
    expect: {
      query_sufficient: true,
      primary_chapter: 87,
    },
  },
];

// ── Runner ──
async function run() {
  console.log("🧪 NCM Classifier — Test Suite\n");
  console.log("=".repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    clearCache();
    console.log(`\n📋 ${test.name}`);
    console.log(`   Query: "${test.query}"${test.specs ? ` + specs: ${JSON.stringify(test.specs)}` : ""}`);

    try {
      const result = await classify({
        query: test.query,
        technical_specs: test.specs,
      });

      const errors: string[] = [];

      // Check expectations
      if (test.expect.query_sufficient !== undefined) {
        if (result.query_sufficient !== test.expect.query_sufficient) {
          errors.push(`query_sufficient: expected ${test.expect.query_sufficient}, got ${result.query_sufficient}`);
        }
      }
      if (test.expect.primary_chapter !== undefined) {
        if (result.primary_chapter !== test.expect.primary_chapter) {
          errors.push(`primary_chapter: expected ${test.expect.primary_chapter}, got ${result.primary_chapter}`);
        }
      }
      if (test.expect.can_close !== undefined) {
        if (result.can_close !== test.expect.can_close) {
          errors.push(`can_close: expected ${test.expect.can_close}, got ${result.can_close}`);
        }
      }
      if (test.expect.final_ncm !== undefined && result.final_ncm) {
        if (!result.final_ncm.startsWith(test.expect.final_ncm.substring(0, 7))) {
          errors.push(`final_ncm: expected ~${test.expect.final_ncm}, got ${result.final_ncm}`);
        }
      }
      if (test.expect.min_candidates !== undefined) {
        if (result.candidates.length < test.expect.min_candidates) {
          errors.push(`candidates: expected ≥${test.expect.min_candidates}, got ${result.candidates.length}`);
        }
      }
      if (test.expect.max_time_ms !== undefined) {
        if (result.processing_time_ms > test.expect.max_time_ms) {
          errors.push(`time: ${result.processing_time_ms}ms > max ${test.expect.max_time_ms}ms`);
        }
      }

      if (errors.length === 0) {
        passed++;
        console.log(`   ✅ PASSED (${result.processing_time_ms}ms)`);
        console.log(`   → ${result.can_close ? result.final_ncm : `${result.candidates.length} opciones`}`);
        console.log(`   → Confianza: ${result.confidence_score.level} (${result.confidence_score.overall}%)`);
      } else {
        failed++;
        console.log(`   ❌ FAILED:`);
        errors.forEach(e => console.log(`      ${e}`));
        console.log(`   → Got: chapter=${result.primary_chapter}, close=${result.can_close}, ncm=${result.final_ncm || "N/A"}`);
        console.log(`   → Candidates: ${result.candidates.map(c => c.ncm).join(", ")}`);
      }
    } catch (error) {
      failed++;
      console.log(`   💥 ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${TESTS.length} tests\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
