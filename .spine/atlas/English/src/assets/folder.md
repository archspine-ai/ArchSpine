The `src/assets/templates` directory serves as the central template repository for the ArchSpine mirror system. It defines the structural and behavioral contracts that govern the entire project, providing reusable blueprints for mirroring documentation, generating structured AI outputs, enforcing architecture constraints, and assessing codebase health.

Notable children within this directory are logically grouped into four primary categories: foundational documentation templates, AI prompt schemas, architectural rule definitions, and view inventories. Each group addresses a distinct implementation area:

- **Foundational documentation templates** establish the baseline structure for mirrored content, ensuring consistency across project documents.
- **AI prompt schemas** define standardized input/output formats for AI-driven analysis and generation, enabling reliable automation.
- **Architectural rules** encode constraints and guidelines that the system must enforce, such as dependency rules and modularity boundaries.
- **View inventories** catalog the various system perspectives (e.g., structural, behavioral, deployment) that can be extracted or generated from the codebase.

Concrete submodules include templates for `mirror-summary.md`, `prompt-schema.json`, `arch-rules.yaml`, and `view-inventory.yaml`. The most critical implementation areas are automated documentation mirroring and AI-assisted architecture validation, both of which depend on the precision and completeness of these templates.