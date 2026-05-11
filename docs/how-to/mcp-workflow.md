# MCP Workflow Patterns

The ArchSpine MCP server exposes individual tools. For real-world tasks, you chain them together into workflows. This guide documents three common patterns: preparing to modify a file, verifying changes after writing code, and investigating an unknown module.

All patterns assume the MCP server is connected and the `.spine` index is populated. See the MCP connection guide for setup instructions.

---

## Pattern 1: Before Modifying a File

Call these three tools in sequence before you create, edit, or delete a file. Each tool answers a specific safety question.

### Step 1: Get file context

```json
{
  "name": "spine_get_file_context",
  "arguments": {
    "filePath": "src/services/view/view-service.ts"
  }
}
```

**What you get:** The file's language, semantic role, responsibilities, public exports, upstream/downstream dependencies, drift status, and a list of architectural rules that apply to this file.

**Use the result to:** Understand what this file is supposed to do and what constraints govern it.

### Step 2: Check change impact

```json
{
  "name": "spine_get_change_impact",
  "arguments": {
    "file": "src/services/view/view-service.ts",
    "maxDepth": 3
  }
}
```

**What you get:** A list of all modules that directly or transitively depend on this file, grouped by distance. The default max depth is 3.

**Use the result to:** Identify which other modules will be affected by your change. A high number of downstream dependents signals broad impact.

### Step 3: Check operation safety

```json
{
  "name": "spine_check_operation",
  "arguments": {
    "filePath": "src/services/view/view-service.ts",
    "operation": "write"
  }
}
```

**What you get:** `allowed` (boolean), `warnings` (array), and `violations` (array). If `allowed` is `false`, violations detail which architecture rules would be breached.

**Use the result to:** Abort the operation if violations are present. Do not proceed when `allowed` is `false`.

### Step 3 variant: Check an import

If your operation is importing a new dependency:

```json
{
  "name": "spine_check_operation",
  "arguments": {
    "filePath": "src/services/view/view-service.ts",
    "operation": "import",
    "importTarget": "src/infra/db.ts"
  }
}
```

This checks whether a cross-layer import would violate architectural rules.

### Expected output snippet (all allowed)

```json
{
  "allowed": true,
  "warnings": [],
  "violations": []
}
```

### Expected output snippet (blocked)

```json
{
  "allowed": false,
  "warnings": [
    "\"src/services/view/view-service.ts\" is in a high-fan-in hub module \"src/services\" (24 dependents). Changes here have broad impact."
  ],
  "violations": [
    {
      "ruleId": "layered-separation",
      "severity": "error",
      "reason": "Import from \"src/services\" to \"src/infra\" violates architectural rules."
    }
  ]
}
```

### Use case

Run this workflow before starting any edit session. It prevents accidental architecture breaches, especially when modifying shared modules or adding cross-layer imports.

---

## Pattern 2: After Writing Code

Use this sequence to validate your changes and verify the architecture remains healthy.

### Step 1: Run a quick scan

```json
{
  "name": "spine_run_scan",
  "arguments": {
    "mode": "quick"
  }
}
```

**What you get:** A fast AST-based scan with file counts and language stats. No LLM cost.

**Use the result to:** Confirm the scanner can parse your new files and their imports resolve correctly. The scan updates the knowledge graph used by subsequent tools.

### Step 2: Run the incremental sync

```json
{
  "name": "spine_run_sync",
  "arguments": {}
}
```

**What you get:** Sync stats: number of files processed, skipped, and failed.

**Use the result to:** Refresh the semantic index and regenerate enabled views. Without this step, the index still reflects the pre-change state.

### Step 3: Check for violations

```json
{
  "name": "spine_get_violations_summary",
  "arguments": {}
}
```

**What you get:** Total violation count, grouped by rule ID, and the top 5 offending files.

**Use the result to:** Immediately see if your changes triggered any architecture rule violations.

### Expected output snippet

```json
{
  "totalViolations": 2,
  "byRuleId": {
    "layered-separation": {
      "count": 2,
      "severity": "error"
    }
  },
  "topFiles": [{ "filePath": "src/cli/commands/deploy.ts", "count": 2 }]
}
```

### Step 4: Get structural diagnostics

```json
{
  "name": "spine_get_diagnostics",
  "arguments": {
    "type": "all"
  }
}
```

**What you get:** Dependency cycles, dead code candidates, and high-fan-in hub modules.

**Use the result to:** Catch structural problems that violations alone do not cover: circular dependencies introduced by your changes, modules that became unreferenced, or modules whose fan-in crossed the hub threshold.

### Expected output snippet

```json
{
  "type": "all",
  "cycles": [
    {
      "cycleId": "cycle-1",
      "nodes": ["src/services/foo", "src/core/bar", "src/services/foo"]
    }
  ],
  "deadCode": [],
  "hubs": []
}
```

### Use case

Run this workflow after every significant code change, before opening a pull request. It replaces manual architecture reviews with automated checks.

---

## Pattern 3: Investigate an Unknown Module

When you encounter a module you have never seen before, use this sequence to build a complete picture of its role and relationships.

### Step 1: Find relevant modules by keyword

```json
{
  "name": "spine_match_semantic",
  "arguments": {
    "query": "authentication",
    "limit": 10
  }
}
```

**What you get:** Ranked module matches with match scores and field-level detail. The query supports comma-separated OR groups and space-separated AND terms (for example, `"auth, database cache"` matches modules about auth OR about both database AND cache).

**Use the result to:** Discover which modules are responsible for a given concern and their relative relevance.

### Expected output snippet

```json
{
  "query": "authentication",
  "totalMatches": 3,
  "matches": [
    {
      "moduleId": "src/services/auth-service",
      "path": "src/services",
      "role": "authentication-handler",
      "score": 0.92,
      "matchedFields": ["role", "responsibilities"]
    }
  ]
}
```

### Step 2: Get full module context

```json
{
  "name": "spine_get_module_context",
  "arguments": {
    "modulePath": "src/services/auth-service"
  }
}
```

**What you get:** Semantic role and responsibilities, upstream dependencies (what this module imports), downstream dependents (what imports this module), active rule violations, and diagnostic flags (cycles, dead code, hub status).

**Use the result to:** Understand the module's boundaries, what it relies on, who relies on it, and whether it has any outstanding health issues.

### Step 3: Query the dependency graph

```json
{
  "name": "spine_query_graph",
  "arguments": {
    "from": "src/services/auth-service",
    "limit": 20
  }
}
```

**What you get:** Dependency edges originating from this module, with compliance status.

**Use the result to:** Trace the exact import connections. Combine with `"to"` to see what depends on it, or filter by `"compliant": false` to find violation edges.

### Expected output snippet

```json
{
  "totalEdges": 8,
  "returnedEdges": 8,
  "edges": [
    {
      "from": "src/services/auth-service",
      "to": "src/infra/db",
      "type": "import",
      "compliant": true
    },
    {
      "from": "src/services/auth-service",
      "to": "src/core/errors",
      "type": "import",
      "compliant": true
    }
  ],
  "nodeSummary": [
    {
      "id": "src/infra/db",
      "path": "src/infra",
      "layer": "infra",
      "role": "database-adapter",
      "fanIn": 12,
      "fanOut": 2
    }
  ]
}
```

### Use case

Run this workflow when you encounter an unfamiliar module during debugging, code review, or onboarding. It gives you a structured understanding of the module without reading its source code line by line.
