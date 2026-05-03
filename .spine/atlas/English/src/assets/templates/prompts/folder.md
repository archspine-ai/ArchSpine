The `prompts/` directory serves as the prompt engineering hub of ArchSpine. It provides prompt template schemas, rendering utilities, and example data necessary for AI agents to generate structured architecture diagrams and semantic summaries in a consistent JSON format. The directory combines three major areas of implementation: prompt construction blocks, schema definitions, and few-shot examples.

Notable children are grouped as follows:

- **`arch-diagram.ts`** – LLM prompt template for generating JSON architecture diagram specifications from project and folder summaries. It embeds the `archDiagramSchema` to enforce output structure (nodes, edges, summaryCards) and provides explicit instructions on allowed node types and constraints.
- **`blocks.ts`** – A library of pure rendering functions for building structured text blocks used in prompt construction. It covers identity, instructions, context, environment, rule violations, git intent, JSON schema, and source content blocks, each with conditional rendering logic.
- **`schemas.ts`** – Schema definitions for all ArchSpine semantic summary units: source files, documents, configuration files, folders, and project-level summaries. These schemas provide the JSON templates that guarantee consistent output from AI agents.
- **`examples.ts`** – Static content with good/bad examples for semantic role descriptions, used as few-shot references in prompts to improve output quality.
- **`index.ts`** – The public API facade that aggregates and re-exports all schemas, rendering functions, and example data into a single import point for downstream modules.

The most important implementation areas are the prompt template in `arch-diagram.ts` (which drives architecture diagram generation) and the schema definitions in `schemas.ts` (which ensure all summary types adhere to a predictable structure). The rendering utilities in `blocks.ts` are the reusable foundation for composing prompts across multiple ArchSpine features.