This directory serves as the demonstration project for the ArchSpine mirror system. It presents a concrete example of how ArchSpine configures, documents, and implements a minimal application.

The content is grouped into three logical areas:

- **Configuration** (`.spine/`): A central directory containing all ArchSpine settings and state. It includes submodules such as `provider`, `scan-policy`, `ignore-chains`, `lang-map`, `sync-health`, `arch-rules`, and `checkpoint`. These collectively define project-level scan policies, language detection mappings, synchronization health snapshots, architecture rule enforcement, and runtime checkpoints.

- **Documentation** (`demo.gif`): The project overview and narrative guide for the ArchSpine system. It explains the core philosophy of spine, atlas, and index layers, covers multi-language documentation support (English, Simplified Chinese, etc.), and describes maintenance of rules, schemas, templates, CLI commands, and build/sync/validation workflows.

- **Source Code** (`src/`): A sample user management system that exemplifies the intended architecture. It contains three layers: `api/` (HTTP endpoints for user creation), `domain/` (User entity management), and `infrastructure/` (database connection handling). The code illustrates both correct architecture and common deviations, serving as a testbed for ArchSpine's analysis pipeline.

Key implementation areas include configuration management, documentation generation, multi-language support, architecture enforcement, and layered application design.