<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/assets/templates/prompts","role":"This directory contains the prompt template engine and schema definitions for generating structured architecture summaries.","responsibility":"Provides the core prompt construction utilities, JSON schema templates, and example data used by the ArchSpine summarization pipeline to generate structured architecture diagrams and semantic summaries from project and folder information.","children":[{"filePath":"src/assets/templates/prompts/arch-diagram.ts","role":"LLM prompt template for generating structured JSON architecture diagram specifications from project and folder summaries.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/blocks.ts","role":"Pure utility functions for rendering structured text blocks, primarily used in LLM prompt construction within ArchSpine.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/examples.ts","role":"Static content module providing few-shot examples for semantic role description generation.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/index.ts","role":"Public API facade aggregating and re-exporting prompt template schemas, rendering blocks, and example data.","fileKind":"source"},{"filePath":"src/assets/templates/prompts/schemas.ts","role":"Schema definition module providing JSON templates for ArchSpine semantic summary units.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:42.794Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# Prompts Directory

This directory contains the prompt template engine and schema definitions for generating structured architecture summaries in the ArchSpine system. It provides the core prompt construction utilities, JSON schema templates, and example data used by the ArchSpine summarization pipeline to generate structured architecture diagrams and semantic summaries from project and folder information.

## Notable Children

- **arch-diagram.ts** – LLM prompt template for generating structured JSON architecture diagram specifications from project and folder summaries.
- **blocks.ts** – Pure utility functions for rendering structured text blocks, primarily used in LLM prompt construction within ArchSpine.
- **examples.ts** – Static content module providing few-shot examples for semantic role description generation.
- **index.ts** – Public API facade aggregating and re-exporting prompt template schemas, rendering blocks, and example data.
- **schemas.ts** – Schema definition module providing JSON templates for ArchSpine semantic summary units.

## Implementation Areas

The most important implementation areas are the prompt template engine (arch-diagram.ts), the block rendering utilities (blocks.ts), and the schema definitions (schemas.ts). These three modules form the core of the prompt construction pipeline, enabling the generation of structured architecture diagrams and semantic summaries.