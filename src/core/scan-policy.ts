export type FileSource = 'git-tracked' | 'git-tracked-plus-untracked' | 'filesystem';

export interface ScanPolicy {
  fileSource: FileSource;
  ignoreChain: {
    inheritGitIgnore: boolean;
    projectIgnore: string;
    localIgnore: string;
  };
  readonly protocolExclusions: string[];
  readonly protocolInclusions: string[];
}

export interface PartialScanPolicy {
  fileSource?: FileSource;
  ignoreChain?: Partial<ScanPolicy['ignoreChain']>;
  protocolExclusions?: string[];
  protocolInclusions?: string[];
}

export const DEFAULT_SCAN_POLICY: ScanPolicy = {
  fileSource: 'git-tracked',
  ignoreChain: {
    inheritGitIgnore: true,
    projectIgnore: '.spineignore',
    localIgnore: '.spineignore.local',
  },
  // The entire .spine/ directory is a protocol-level hard exclusion.
  // RuleEngine and config readers access these files directly via fs,
  // so no scan-pipeline inclusion is needed or desired.
  protocolExclusions: [
    '.spine/',
    '**/.spine/',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'bun.lockb',
  ],
  protocolInclusions: ['.spine/rules/', '.spine/config.json'],
};

export function resolveScanPolicy(policy?: PartialScanPolicy): ScanPolicy {
  return {
    fileSource: policy?.fileSource ?? DEFAULT_SCAN_POLICY.fileSource,
    ignoreChain: {
      inheritGitIgnore:
        policy?.ignoreChain?.inheritGitIgnore ?? DEFAULT_SCAN_POLICY.ignoreChain.inheritGitIgnore,
      projectIgnore:
        policy?.ignoreChain?.projectIgnore ?? DEFAULT_SCAN_POLICY.ignoreChain.projectIgnore,
      localIgnore: policy?.ignoreChain?.localIgnore ?? DEFAULT_SCAN_POLICY.ignoreChain.localIgnore,
    },
    protocolExclusions: policy?.protocolExclusions ?? [...DEFAULT_SCAN_POLICY.protocolExclusions],
    protocolInclusions: policy?.protocolInclusions ?? [...DEFAULT_SCAN_POLICY.protocolInclusions],
  };
}
