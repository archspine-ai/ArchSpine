# Build a Custom View

Views are generated artifacts that derive insight from the semantic index. ArchSpine ships with 7 built-in views. This guide covers implementing a custom `ViewProducer`.

## Prerequisites

You should be familiar with:

- The ArchSpine view system (run `spine view show` and read [Reference: View Producers](/reference/view-producers))
- TypeScript interfaces and async patterns
- The semantic index data model (see `src/types/protocol.ts`)

## The ViewProducer Interface

Every view producer implements this interface, defined in `src/services/view/producer.ts`:

```typescript
export interface ViewProducer {
  derive(ctx: ViewContext): Promise<ViewArtifact>;
}
```

### ViewContext

The `derive()` method receives a `ViewContext`:

```typescript
export interface ViewContext {
  rootDir: string; // Repository root path
  loader: ViewIndexLoader; // Query the semantic index
  outputManager: ViewOutputManager; // Persist artifacts
  runtimeIO?: RuntimeIO; // Console/logging (optional)
  llmClient?: LLMClient; // LLM for generative views (optional)
  isFullSync: boolean; // true during 'spine build', false during 'spine sync'
}
```

### ViewIndexLoader

Provided by `src/services/view/index-loader.ts`, the loader lets you query the semantic index:

```typescript
// Key methods on ViewIndexLoader
loader.getAllIndexEntries(): Iterable<IndexEntry>;
loader.getIndexEntry(filePath: string): IndexEntry | undefined;
loader.getFolderSummary(dirPath: string): FolderSummary | undefined;
```

Each `IndexEntry` contains the file's semantic summary (responsibilities, dependencies, symbols, etc.) as defined in `src/types/protocol.ts`.

### ViewOutputManager

Saves artifacts to `.spine/view/`:

```typescript
export interface ViewOutputManager {
  saveView(fileName: string, data: unknown): void; // JSON files
  saveViewMarkdown(fileName: string, content: string): void; // Markdown files
  saveViewHtml(fileName: string, html: string): void; // HTML files
  deleteViewArtifacts(fileNames: string[]): void; // Cleanup
}
```

Files are written relative to `.spine/view/`. For example, `saveView('my-view.json', data)` writes to `.spine/view/my-view.json`. For nested paths, use `saveViewMarkdown('pages/my-page.md', content)`.

### ViewArtifact

The return type reports what was produced:

```typescript
export interface ViewArtifact {
  viewType: ViewType; // Your view's type identifier
  generated: boolean; // true if produce
  generatedAt: string; // ISO timestamp
  reason?: string; // Why generation failed (if !generated)
  metrics: Record<string, number>; // View-specific counters
}
```

## Simple Example: Dependency Count View

This custom view reads the semantic index and produces a JSON artifact of per-file dependency counts.

Create a file in your project (e.g., `src/custom/dependency-count-view.ts`):

```typescript
import type { ViewProducer, ViewContext, ViewArtifact } from '../services/view/producer.js';

const VIEW_TYPE = 'dependency-count' as const;

interface DependencyCountItem {
  filePath: string;
  internalDeps: number;
  externalDeps: number;
  totalDeps: number;
}

export const dependencyCountProducer: ViewProducer = {
  async derive(ctx: ViewContext): Promise<ViewArtifact> {
    const items: DependencyCountItem[] = [];

    for (const entry of ctx.loader.getAllIndexEntries()) {
      // Count internal vs external dependencies
      const internalDeps =
        entry.dependencies?.filter((d) => d.startsWith('.') || d.startsWith('src/')).length ?? 0;
      const externalDeps =
        entry.dependencies?.filter((d) => !d.startsWith('.') && !d.startsWith('src/')).length ?? 0;

      if (internalDeps > 0 || externalDeps > 0) {
        items.push({
          filePath: entry.filePath,
          internalDeps,
          externalDeps,
          totalDeps: internalDeps + externalDeps,
        });
      }
    }

    // Sort by total dependency count descending
    items.sort((a, b) => b.totalDeps - a.totalDeps);

    // Persist the result
    ctx.outputManager.saveView('dependency-count.json', {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      viewType: VIEW_TYPE,
      summary: `Dependency count view — ${items.length} files with dependencies`,
      items,
    });

    return {
      viewType: VIEW_TYPE,
      generated: true,
      generatedAt: new Date().toISOString(),
      metrics: {
        filesAnalyzed: items.length,
        totalInternalDeps: items.reduce((s, i) => s + i.internalDeps, 0),
        totalExternalDeps: items.reduce((s, i) => s + i.externalDeps, 0),
      },
    };
  },
};
```

## Registration

Register your producer in the view registry. The entry point is `src/services/view/producer-registry.ts`:

```typescript
import { dependencyCountProducer } from '../../custom/dependency-count-view.js';

registerViewProducer('dependency-count', dependencyCountProducer);
```

Currently, registration requires editing `producer-registry.ts` directly. A `spine view create <name>` scaffold command is planned but not yet shipped.

### Add View Definition

Update the view definitions in `src/services/view/view-registry.ts` so the view shows up in `spine view show`:

```typescript
{
  id: 'dependency-count',
  title: 'Dependency Count',
  description: 'Per-file dependency count view sorted by coupling intensity.',
  defaultEnabled: false,
  requiresFullSync: false,
  requiresLlm: false,
  outputs: ['dependency-count.json'],
}
```

## Testing Your View

After registration and a rebuild of the project:

```bash
spine view enable dependency-count
spine view generate
```

Then check the output:

```bash
cat .spine/view/dependency-count.json
```

## View That Uses the LLM

Views can use the optional `llmClient` for generative output. Set `requiresLlm: true` in the view definition.

```typescript
export const myGenerativeProducer: ViewProducer = {
  async derive(ctx: ViewContext): Promise<ViewArtifact> {
    if (!ctx.llmClient) {
      return {
        viewType: 'my-generative-view',
        generated: false,
        generatedAt: new Date().toISOString(),
        reason: 'LLM client not available',
        metrics: {},
      };
    }

    const response = await ctx.llmClient.complete({
      prompt: '...',
      systemPrompt: '...',
    });

    ctx.outputManager.saveViewMarkdown('pages/my-generative-view.md', response.content);

    return {
      viewType: 'my-generative-view',
      generated: true,
      generatedAt: new Date().toISOString(),
      metrics: { tokensUsed: response.usage?.totalTokens ?? 0 },
    };
  },
};
```

## Current Limitations

- **No hot registration** -- New views require editing `producer-registry.ts` and rebuilding the CLI.
- **No external registration API** -- Views must live inside the ArchSpine source tree. A plugin system for third-party views is planned but not yet implemented.
- **No `spine view create` scaffold** -- The scaffolding command for bootstrapping new view files is planned but not yet shipped.
- **All-or-nothing enablement** -- Currently there is no per-package view scoping. Views operate on the entire index.

## Built-in Views Reference

For production patterns, study the built-in producers in `src/services/view/`:

| View                 | Source File                    | Requires LLM |
| -------------------- | ------------------------------ | ------------ |
| Public Surface       | `public-surface-view.ts`       | No           |
| Risk Hotspots        | `risk-hotspots-view.ts`        | No           |
| Architecture Diagram | `architecture-diagram-view.ts` | No           |
| Project Health       | `project-health-view.ts`       | No           |
| Agent Briefing       | `agent-briefing-view.ts`       | No           |
| Change Impact        | `change-impact-view.ts`        | No           |
| Module Contract      | `module-contract-view.ts`      | No           |
