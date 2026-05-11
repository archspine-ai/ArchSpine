import * as fs from 'fs';

export interface DashboardData {
  hasSpine: boolean;
  lastSync: string | null;
  enabledViews: string[];
  rulesCount: number;
}

/**
 * Read ArchSpine dashboard data from the .spine/ control plane.
 * This is a thin data-access function that lives in services/ so CLI modules
 * stay as thin entrypoints and do not absorb file I/O logic.
 */
export function getDashboardData(rootDir: string): DashboardData {
  const spineDir = rootDir + '/.spine';
  const hasSpine = fs.existsSync(spineDir);

  if (!hasSpine) {
    return { hasSpine: false, lastSync: null, enabledViews: [], rulesCount: 0 };
  }

  try {
    const configRaw = fs.readFileSync(spineDir + '/config.json', 'utf-8');
    const config = JSON.parse(configRaw);
    const enabledViews: string[] = config.view?.enabledViews || [];

    const rulesDir = spineDir + '/rules';
    const rulesCount = fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir).length : 0;

    const manifestPath = spineDir + '/manifest.json';
    const manifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      : null;
    const lastSync = manifest?.sync?.lastSyncAt
      ? new Date(manifest.sync.lastSyncAt).toLocaleString()
      : 'never';

    return { hasSpine: true, lastSync, enabledViews, rulesCount };
  } catch {
    return { hasSpine: true, lastSync: '(读取失败)', enabledViews: [], rulesCount: 0 };
  }
}
