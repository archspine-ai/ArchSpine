import type { RuntimeIO } from '../../infra/runtime-io.js';
import type { LLMClient } from '../../infra/llm.js';
import type { ViewType } from '../../types/view.js';
import type { ViewIndexLoader } from './index-loader.js';

export type { ViewType };

/**
 * Output surface that view producers use to persist their artifacts.
 * Mirrors the relevant subset of OutputManager so producers stay decoupled
 * from the concrete implementation.
 */
export interface ViewOutputManager {
  saveView(fileName: string, data: unknown): void;
  saveViewMarkdown(fileName: string, content: string): void;
  saveViewHtml(fileName: string, html: string): void;
  deleteViewArtifacts(fileNames: string[]): void;
}

/**
 * Aggregate context that a ViewProducer needs during derivation.
 * All producers receive the same shape; each producer decides which
 * fields it actually consumes.
 */
export interface ViewContext {
  rootDir: string;
  loader: ViewIndexLoader;
  outputManager: ViewOutputManager;
  runtimeIO?: RuntimeIO;
  llmClient?: LLMClient;
  isFullSync: boolean;
}

/**
 * Uniform envelope returned by every ViewProducer.derive() call.
 * Callers inspect `generated` to decide whether a view was successfully
 * produced, and use `metrics` for view-specific counters.
 */
export interface ViewArtifact {
  viewType: ViewType;
  generated: boolean;
  generatedAt: string;
  reason?: string;
  metrics: Record<string, number>;
}

/**
 * Every view producer implements this interface.
 * `derive()` receives the full context, performs its logic (loading,
 * scoring, rendering, saving), and returns a ViewArtifact.
 */
export interface ViewProducer {
  derive(ctx: ViewContext): Promise<ViewArtifact>;
}
