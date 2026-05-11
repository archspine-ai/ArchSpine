export type MCPContextMode = 'off' | 'project-first' | 'search-first';

const SEARCH_PRIMING_TOOLS = new Set([
  'spine_query_invariants',
  'spine_query_responsibilities',
  'spine_preview_scan',
  'spine_get_sync_status',
  'spine_get_baseline_status',
  'spine_get_violations_summary',
]);

export class MCPContextGate {
  private projectPrimed = false;
  private searchPrimed = false;

  constructor(private readonly mode: MCPContextMode) {}

  public noteResourceRead(uri: string): void {
    if (uri === 'spine://project') {
      this.projectPrimed = true;
    }
  }

  public noteToolCall(name: string): void {
    if (SEARCH_PRIMING_TOOLS.has(name)) {
      this.searchPrimed = true;
    }
  }

  public requireResourceAccess(resourceKind: 'project' | 'folder' | 'file'): string | null {
    if (this.mode === 'off' || resourceKind === 'project') {
      return null;
    }

    if (this.mode === 'project-first' && !this.projectPrimed) {
      return 'Read spine://project first to prime the project topology before opening folder or file resources.';
    }

    if (this.mode === 'search-first' && !this.searchPrimed) {
      return 'Run spine_query_responsibilities, spine_query_invariants, or spine_preview_scan first to prime search context before opening folder or file resources.';
    }

    return null;
  }
}
