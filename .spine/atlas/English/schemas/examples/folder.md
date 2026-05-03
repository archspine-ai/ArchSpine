This directory contains example configuration files for the ArchSpine repository indexing and rule enforcement system. The examples are grouped into three categories: **unit definitions** (spine-folder-unit.example.json, spine-project-unit.example.json, spine-unit.example.json), **index metadata** (spine-manifest.example.json), and **architectural rules** (spine-rule-document.example.json, spine-rule.example.md).  

Key implementation areas are the repository indexing pipeline (folder and project units define module containers and provenance tracking), synchronization and file inventory (the manifest tracks sync state, content hashes, and reverse indices), and domain boundary enforcement (rules prevent direct database imports in application code).  

Concrete submodules include:  
- **spine-folder-unit.example.json** – defines the application module container for the indexing pipeline.  
- **spine-manifest.example.json** – provides metadata for synchronization, file inventory, and reverse index lookups.  
- **spine-project-unit.example.json** – describes project metadata, module structure (src/docs), and provenance tracking.  
- **spine-rule-document.example.json** – enforces a prohibition on direct database-layer imports.  
- **spine-rule.example.md** – specifies a mandatory rule with scope, severity, and rationale.  
- **spine-unit.example.json** – models an authentication entry module with login/logout functions.