import { Scanner } from '../engines/scanner.js';
import { discoverLanguages } from '../ast/lang-discovery.js';
import { Manifest } from '../infra/manifest.js';
import type { LanguageSnapshot } from '../types/protocol.js';
import type { Config } from '../infra/config.js';

/**
 * Run language discovery for a project: scan files, detect languages,
 * and persist the snapshot to the manifest.
 * This lives in services/ so CLI bootstrap modules stay thin.
 */
export async function discoverProjectLanguages(
  rootDir: string,
  config: Config,
  _runtimeService: unknown,
): Promise<LanguageSnapshot> {
  const initScanner = new Scanner(rootDir, config.getScanPolicy());
  const allFiles = initScanner.getAllTrackedFiles();
  const langSnapshot = await discoverLanguages(allFiles);

  const manifestInstance = Manifest.open(rootDir);
  manifestInstance.saveLanguageSnapshot(langSnapshot);

  return langSnapshot;
}
