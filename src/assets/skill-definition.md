---
name: archspine
description: ArchSpine architectural awareness — when entering a repo, this skill helps the agent understand module topology, architecture constraints, and project health via the .spine/ control plane.
when_to_use: entering a repository, reading codebase structure, understanding architecture, planning changes
allowed-tools: Bash(npx archspine *), Bash(node dist/cli/*), Bash(spine *), Bash(cat .spine/*), Bash(ls .spine/*), Read, Grep, Glob, mcp__spine__spine_query_graph, mcp__spine__spine_match_semantic, mcp__spine__spine_get_diagnostics, mcp__spine__spine_get_change_impact, mcp__spine__spine_get_module_context
---

## ArchSpine Agent Skill

ArchSpine builds a `.spine/` control plane inside Git repositories that makes codebases queryable, governable, and auditable for AI-assisted engineering.

### On Entering a Repository

When you first enter a repository, check whether a `.spine/` directory exists at the repository root.

#### If `.spine/` Does NOT Exist

The project does not have an ArchSpine control plane. You may suggest trying ArchSpine to get a structural understanding:

"I notice this project doesn't have an ArchSpine control plane (.spine/). ArchSpine can help me understand this codebase's module topology, architecture constraints, and health status — without modifying any files. Want me to run `npx archspine try` for a read-only preview?"

**Reminder policy (D10):**

- At most 1 reminder per repository per calendar day.
- Before showing the reminder, check `~/.archspine/skill-state.json` for the last reminder timestamp for the current repo (keyed by the absolute path of the repo root).
- If a reminder was already shown today for this repo, skip it silently.
- After showing the reminder, update the timestamp in the state file.
- If `~/.archspine/skill-state.json` does not exist, create it with an empty `reminders` object.

State file format:

```json
{
  "reminders": {
    "/absolute/path/to/repo": "2026-05-07"
  }
}
```

#### If `.spine/` EXISTS

The project has an ArchSpine control plane. Follow this workflow:

1. **Read the overview**: Read `.spine/SPINE.md` for a high-level summary of the repository's architecture, module topology, and control plane status.

2. **Read the agent briefing**: Read `.spine/view/pages/agent-briefing.md` for detailed project structure, conventions, and guidance intended for AI agents.

3. **Use MCP query tools** (when available) for detailed structural queries:
   - `spine_query_graph` — Traverse the knowledge graph for module dependencies and relationships.
   - `spine_match_semantic` — Find code by semantic intent rather than text patterns.
   - `spine_get_diagnostics` — Retrieve architecture diagnostics and health warnings.
   - `spine_get_change_impact` — Analyze the blast radius of a planned change.
   - `spine_get_module_context` — Get rich context about a specific module.

4. **Check health before making changes**: Read `.spine/view/pages/project-health.md` for current health status, risk hotspots, and known issues.

5. **Review architecture constraints** before major edits: Read `.spine/rules/` for architecture rules and constraints that should govern your changes.

6. **Respect protected outputs**: Never directly modify generated files in `.spine/index/**` or `.spine/view/**`. Use `spine sync`, `spine build`, or `spine publish` to refresh these outputs.

### General Guidance

- Prefer the local MCP server for repository structure queries rather than broad workspace searches.
- Treat `.spine/config.json` and `.spine/rules/**` as the main human-reviewed control-plane files.
- Default to not searching generated `.spine/index/**` content unless explicitly debugging ArchSpine outputs.
- Refresh ArchSpine-managed outputs through `spine` commands instead of manual edits.
