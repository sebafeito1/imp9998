# CLAUDE.md — Instrucciones para Claude Code

## Sobre el proyecto
ncm-classifier es un sistema de clasificación arancelaria NCM (Nomenclatura Común del Mercosur) para Argentina. Usa la API de Claude (Sonnet) para clasificar productos con razonamiento paso a paso.

## Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Hono (API HTTP)
- **LLM**: Claude Sonnet via @anthropic-ai/sdk
- **Tests**: Runner custom con tsx

## Comandos
```bash
npm install          # Instalar dependencias
npm run dev          # Servidor con hot-reload (tsx watch)
npm start            # Servidor producción
npm test             # Correr tests (requiere ANTHROPIC_API_KEY)
```

## Arquitectura
```
Consulta → Cache? → SÍ → resultado
                 → NO → Sonnet (chain-of-thought) → Parse JSON → Confidence Score → Cache → resultado
```

El sistema NO usa un fuzzy matcher local para clasificar. TODO va a Sonnet, que razona el capítulo y la posición con fundamento en RGI y Notas de Sección/Capítulo.

## Reglas CRÍTICAS

### 1. Nunca inferir datos técnicos como confirmados
Si el usuario dice "generador" sin especificar combustible/potencia, esos atributos son `status: "unknown"`, NUNCA `"confirmed"`. Solo es `"confirmed"` si el usuario lo dijo explícitamente.

### 2. No cerrar clasificación sin datos suficientes
`can_close: true` SOLO cuando todos los atributos con `classification_impact: "critical"` tienen `status: "confirmed"`. Si hay atributos críticos unknown, devolver opciones.

### 3. Confidence score es híbrido
No depende solo del juicio del modelo. Se calcula en `src/classifier/confidence.ts` con 4 factores ponderados. NO cambiar esa lógica sin revisión.

### 4. Fundamento legal obligatorio
Toda clasificación debe tener `legal_basis` con RGI y/o Notas de Sección/Capítulo. Nunca devolver un NCM sin fundamento.

### 5. Contexto argentino
"Termo" = termo para mate (96.17), NO té (09.02). El system prompt tiene instrucciones específicas para esto.

### 6. Antidumping sobre FOB
Si se implementa cálculo fiscal, el antidumping se calcula sobre FOB, no sobre CIF.

## Estructura de archivos
```
src/
  index.ts                    # Entry point (Hono server)
  types.ts                    # Tipos TypeScript
  api/routes.ts               # Endpoints HTTP
  classifier/
    classify.ts               # Orquestador principal
    prompt.ts                 # System prompt + user prompt builder
    confidence.ts             # Score de confianza híbrido
  data/
    ncm-database.ts           # Capítulos, RGI, Notas de Sección
tests/
  run.ts                      # Test suite
```

## Base de datos NCM
La base actual (`src/data/ncm-database.ts`) contiene:
- 97 capítulos con DI default y notas clave
- 21 secciones con notas de sección
- 6 Reglas Generales de Interpretación

Esta base es **reemplazable**. Cuando tengamos un CSV/Excel con las ~10.000 posiciones completas, se convierte a este formato. El sistema está diseñado para funcionar sin tener TODAS las posiciones: Sonnet conoce las posiciones de su entrenamiento, y la base local sirve para validar/enriquecer.

## API
```bash
# Clasificar
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query":"hidrolavadora"}'

# Con specs
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"query":"generador","technical_specs":{"combustible":"diesel","potencia":"50kVA"}}'

# Health
curl http://localhost:3000/api/health

# Clear cache
curl -X POST http://localhost:3000/api/cache/clear
```

## Próximos pasos
1. Base NCM completa en CSV/JSON (las ~10.000 posiciones con DI real)
2. Enricher que valide el NCM del modelo contra la base local
3. UI web (React)
4. Módulo de revisión humana
5. Feedback loop: cuando el usuario elige una opción, guardar para mejorar
