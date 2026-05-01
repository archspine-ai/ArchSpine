export interface LanguageSnapshot {
  schemaVersion: number;
  detectedExtensions: string[];
  languages: Record<string, LanguageSupport>;
}

export interface LanguageSupport {
  extensions: string[];
  status: 'available' | 'unavailable' | 'unsupported';
  reason?: string;
}

export interface LanguageDelta {
  newExtensions: string[];
  statusChanges: Array<{
    language: string;
    oldStatus: LanguageSupport['status'];
    newStatus: LanguageSupport['status'];
  }>;
}
