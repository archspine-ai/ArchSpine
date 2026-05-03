This directory constitutes the prompt engineering toolkit for ArchSpine, containing all reusable components for constructing LLM prompts that generate structured JSON summaries. Its files are organized into four functional groups:

- **Architecture diagram prompt** (`arch-diagram.ts`): Builds a complete LLM prompt that produces JSON architecture diagram specifications from project and folder summaries, including schema-driven constraints.
- **Block rendering utilities** (`blocks.ts`): Provides pure functions for rendering identity, instructions, context, environment, rule violation checks, git intent, JSON schema, and source content blocks – the core building blocks for any prompt.
- **Example data** (`examples.ts`): Supplies few-shot samples that define quality standards for role descriptions, used to guide the model toward correct output.
- **Schema definitions** (`schemas.ts`): Defines JSON templates for five ArchSpine summary units (source file, document, configuration file, folder, project), ensuring consistent output structure across all mirroring tasks.

The `index.ts` file aggregates and re‑exports all schemas, rendering blocks, and examples, providing a single entry point for downstream prompt‑generation modules. Together, these components form a modular, reusable layer that drives the semantic summarization pipeline of the ArchSpine mirror system.