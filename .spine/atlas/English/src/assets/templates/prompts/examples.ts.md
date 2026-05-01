<!-- spine-content-hash:645b7262065c3a9a5fa8937fa9db825e8bf58389bcb4239e7b5cfcb5dc6e276d -->
# ArchSpine – `sourceRoleExamples` Module Summary

**Role:**  
This module provides static, hard-coded few-shot examples that guide the generation of semantic role descriptions. It is a content source for prompt engineering within the ArchSpine summarization pipeline.

**Key Responsibilities:**
- Defines quality standards for role descriptions by offering concrete good and bad examples.
- Supplies template content used to shape prompts for AI-driven role description generation.

**Notable Invariants & Negative Scope:**
- The exported content is a read-only template literal; it is never modified at runtime.
- This module does **not** perform dynamic example generation, runtime logic, or validation/parsing of example content.

**Exported Surface:**
- `sourceRoleExamples` – the sole public symbol, a static string constant containing the example set.

**Change Intent:**  
The architectural intent is to provide canonical, high-quality examples that ensure consistency and precision across the system. Recent changes restored or updated LLM-authored markdown generation content, likely to improve the example set used for prompting.