import * as path from 'path';
import { LanguageSnapshot, LanguageDelta, LanguageSupport } from '../types/protocol.js';
import { LangRegistry } from './lang-registry.js';

/**
 * Scan a collection of files and identify the language landscape.
 */
export async function discoverLanguages(files: string[]): Promise<LanguageSnapshot> {
  const extensions = new Set<string>();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext) {
      extensions.add(ext);
    }
  }

  const detectedExtensions = Array.from(extensions).sort();
  const languages: Record<string, LanguageSupport> = {};

  // Group extensions by language and resolve status
  for (const ext of detectedExtensions) {
    const resolution = await LangRegistry.resolve(`dummy${ext}`);

    if (
      !resolution.supported &&
      resolution.reason === 'No language mapping found for file extension.'
    ) {
      // Truly unsupported extension (no mapping in LANG_EXTENSION_MAP)
      // We don't create a 'language' entry for these, they stay in detectedExtensions
      continue;
    }

    const config = resolution.config;
    if (config) {
      const langName = config.ruleName;
      if (!languages[langName]) {
        languages[langName] = {
          extensions: [],
          status: 'available',
        };
      }

      if (!languages[langName].extensions.includes(ext)) {
        languages[langName].extensions.push(ext);
      }

      if (!resolution.supported) {
        languages[langName].status = 'unavailable';
        languages[langName].reason = resolution.reason;
      } else {
        // If it was already unavailable due to another extension of the same lang,
        // keep it unavailable unless this one is somehow available (unlikely).
        if (languages[langName].status !== 'unavailable') {
          languages[langName].status = 'available';
        }
      }
    }
  }

  return {
    schemaVersion: 1,
    detectedExtensions,
    languages,
  };
}

/**
 * Compare two snapshots to find changes in extensions or support status.
 */
export function diffLanguages(prev: LanguageSnapshot, curr: LanguageSnapshot): LanguageDelta {
  const newExtensions = curr.detectedExtensions.filter(
    (ext) => !prev.detectedExtensions.includes(ext),
  );
  const statusChanges: LanguageDelta['statusChanges'] = [];

  for (const [lang, currSupport] of Object.entries(curr.languages)) {
    const prevSupport = prev.languages[lang];
    if (!prevSupport || prevSupport.status !== currSupport.status) {
      statusChanges.push({
        language: lang,
        oldStatus: prevSupport ? prevSupport.status : ('unsupported' as const), // 'unsupported' as a placeholder for "newly discovered"
        newStatus: currSupport.status,
      });
    }
  }

  return {
    newExtensions,
    statusChanges,
  };
}

/**
 * Resolve language support for a specific file, proxying LangRegistry.
 */
export async function resolveLanguage(filePath: string) {
  return LangRegistry.resolve(filePath);
}
