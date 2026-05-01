# ArchSpine Strategy

ArchSpine is positioned as a semantic control plane for AI-assisted software engineering. The goal is not to generate prettier docs; it is to make repository structure explicit, queryable, and governable.

## The problem

Large repositories decay in predictable ways:

- God files absorb too much logic
- responsibilities blur across layers
- historical intent disappears as teams change

Traditional prompt-based AI workflows make this worse because they treat repository understanding as an ad hoc reconstruction problem.

## The thesis

ArchSpine addresses that problem with three core ideas:

1. deterministic extraction
2. explicit governance
3. durable semantic memory

### Deterministic extraction

Use AST-derived structure as the stable base so agents are not guessing at syntax or dependencies.

### Governance

Let teams declare architectural rules in `.spine/rules/`, then audit and repair against those rules.

### Semantic memory

Persist role, responsibility, and drift information so repository intent survives beyond individual contributors.

### Execution model

The runtime must match the strategy:

- pipeline steps should use explicit stage input/output contracts
- shared runtime state should stay narrow and readable
- transient artifacts should be kept separate from telemetry
- orchestration should live in services, not leak into task internals

This keeps ArchSpine deterministic enough to govern, while still being practical for CLI-first workflows and future MCP or daemon-style entry points.

## Open core boundary

Open-source layer:

- `.spine` protocol
- extractors
- base CLI
- local aggregation
- local MCP support

Commercial extensions, if pursued later, should focus on organization-scale control-plane value rather than basic repository generation.

## Strategic moat

ArchSpine sits inside four high-value workflow moments:

1. commit-time sync and repository hygiene
2. CI and PR-time governance
3. agent context retrieval through MCP
4. onboarding and repository comprehension

## Long-term goal

Make `.spine` feel as standard to AI-readable repositories as `package.json` feels to JavaScript projects.

## Related docs

- [Architecture Overview](ARCHITECTURE-OVERVIEW)
- [Task Execution Model](TASK-EXECUTION-MODEL)
