import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { ASTExtractor } from '../dist/ast/extractor.js';
import { buildSourcePromptArtifacts } from '../dist/infra/prompt-context.js';
import { OpenAICompatibleClient } from '../dist/infra/llm/providers/openai.js';

const rootDir = path.resolve(process.cwd());
const logsDir = path.join(rootDir, 'externaldocs', 'logs');
const cumulativeLogPath = path.join(logsDir, 'PHASE5-LIVE-BENCHMARK-LOG.json');
const latestSummaryPath = path.join(logsDir, 'PHASE5-LIVE-BENCHMARK-LATEST.md');
const extractor = new ASTExtractor();

const sampleConfigs = [
  {
    scenarioId: 'small-file-summarize',
    samplePath: 'research/bench/corpus/fixtures/small-file.ts',
    taskMode: 'summarize',
    promptTier: 'balanced',
    dependencyContext: [
      'Known Internal Dependency Semantics:',
      '- `src/domain/user.ts`: role=UserModel; responsibilities=identity shaping; display-name normalization',
    ].join('\n'),
    ruleData: '',
    previousSemantic: {
      role: 'UserSummaryMapper',
      responsibilities: ['Create compact user projections'],
    },
  },
  {
    scenarioId: 'large-file-summarize',
    samplePath: 'research/bench/corpus/fixtures/large-file.ts',
    taskMode: 'summarize',
    promptTier: 'balanced',
    dependencyContext: [
      'Known Internal Dependency Semantics:',
      '- `src/pipeline/step.ts`: role=PipelineStep; responsibilities=execute work units; surface failures',
      '- `src/pipeline/report.ts`: role=PipelineReport; responsibilities=aggregate outcomes',
      '',
      'Resolved Symbol References:',
      '- Symbol execute likely references: `src/pipeline/step.ts`',
    ].join('\n'),
    ruleData: '',
    previousSemantic: {
      role: 'PipelineCoordinator',
      responsibilities: ['Coordinate multi-step execution', 'Aggregate step outcomes'],
    },
  },
  {
    scenarioId: 'multi-import-summarize',
    samplePath: 'research/bench/corpus/fixtures/multi-import.ts',
    taskMode: 'summarize',
    promptTier: 'balanced',
    dependencyContext: [
      'Known Internal Dependency Semantics:',
      '- `node:crypto`: role=HashUtility; responsibilities=create digests',
      '- `node:fs`: role=FileReader; responsibilities=read fixture content',
      '- `node:path`: role=PathResolver; responsibilities=join paths',
      '',
      'Resolved Symbol References:',
      '- Symbol createHash likely references: `node:crypto`',
      '- Symbol readFileSync likely references: `node:fs`',
    ].join('\n'),
    ruleData: '',
    previousSemantic: {
      role: 'SnapshotReader',
      responsibilities: ['Read fixture content', 'Create deterministic digests'],
    },
  },
  {
    scenarioId: 'multi-import-validate',
    samplePath: 'research/bench/corpus/fixtures/multi-import.ts',
    taskMode: 'validate',
    promptTier: 'balanced',
    dependencyContext: [
      'Known Internal Dependency Semantics:',
      '- `src/snapshots/repository.ts`: role=SnapshotRepository; responsibilities=read snapshots; abstract file storage',
      '- `node:crypto`: role=HashUtility; responsibilities=create digests',
      '- `node:fs`: role=FileReader; responsibilities=read fixture content',
      '',
      'Resolved Symbol References:',
      '- Symbol readFileSync likely references: `node:fs`',
      '- Symbol createHash likely references: `node:crypto`',
    ].join('\n'),
    ruleData: [
      '[Rule: no-direct-fs] (Severity: warning)',
      'Title: Snapshot digest service should not read files directly',
      'Summary: Use a repository boundary instead of direct readFileSync calls inside coordination modules.',
      '',
      '[Rule: hash-must-be-wrapped] (Severity: advisory)',
      'Title: Hash logic should be isolated behind a digest utility',
      'Summary: Prefer dedicated digest utilities instead of direct createHash usage in service code.',
    ].join('\n'),
    previousSemantic: {
      role: 'SnapshotDigestService',
      responsibilities: [
        'Read snapshots through repository boundary',
        'Create deterministic digests',
      ],
    },
  },
  {
    scenarioId: 'rule-dense-validate',
    samplePath: 'research/bench/corpus/fixtures/rule-dense.ts',
    taskMode: 'validate',
    promptTier: 'balanced',
    dependencyContext: [
      'Known Internal Dependency Semantics:',
      '- `src/services/logger.ts`: role=ServiceLogger; responsibilities=structured logging; audit tracing',
      '- `src/db/client.ts`: role=DatabaseClient; responsibilities=query database; data persistence',
      '',
      'Resolved Symbol References:',
      '- Symbol query likely references: `src/db/client.ts`',
      '- Symbol logger likely references: `src/services/logger.ts`',
    ].join('\n'),
    ruleData: [
      '[Rule: no-direct-db] (Severity: error)',
      'Title: Service must not call database directly',
      'Summary: Services must call a repository or API boundary instead of db client methods.',
      '',
      '[Rule: service-must-log] (Severity: warning)',
      'Title: Service must emit audit logs',
      'Summary: Service methods should log important state transitions through logger.',
    ].join('\n'),
    previousSemantic: {
      role: 'UserProfileService',
      responsibilities: ['Load user profile data', 'Coordinate audit logging'],
    },
  },
  {
    scenarioId: 'drift-prone-summarize',
    samplePath: 'research/bench/corpus/fixtures/drift-prone.ts',
    taskMode: 'summarize',
    promptTier: 'balanced',
    dependencyContext: [
      'Known Internal Dependency Semantics:',
      '- `src/flags/rollout.ts`: role=RolloutPolicy; responsibilities=gate feature rollout; calculate percentage',
    ].join('\n'),
    ruleData: '',
    previousSemantic: {
      role: 'FeatureFlagClient',
      responsibilities: ['Resolve feature flags', 'Expose rollout percentage'],
    },
  },
  {
    scenarioId: 'drift-prone-validate',
    samplePath: 'research/bench/corpus/fixtures/drift-prone.ts',
    taskMode: 'validate',
    promptTier: 'balanced',
    dependencyContext: [
      'Known Internal Dependency Semantics:',
      '- `src/flags/policy.ts`: role=RolloutPolicy; responsibilities=define rollout invariants; naming policy',
    ].join('\n'),
    ruleData: [
      '[Rule: feature-prefix-required] (Severity: warning)',
      'Title: Feature flags must use feature. prefix',
      'Summary: Flags should only be considered valid when they start with feature.',
      '',
      '[Rule: rollout-range-safe] (Severity: advisory)',
      'Title: Rollout percentage must remain within safe bounds',
      'Summary: Rollout percentage should remain bounded and deterministic.',
    ].join('\n'),
    previousSemantic: {
      role: 'FeatureFlagPolicyClient',
      responsibilities: ['Validate feature naming', 'Expose bounded rollout percentage'],
    },
  },
];

const provider = process.env.SPINE_PROVIDER || 'openai';
const model = process.env.SPINE_MODEL;
const baseURL = process.env.SPINE_BASE_URL;
const apiKey = process.env.SPINE_API_KEY;

if (!apiKey) {
  throw new Error('SPINE_API_KEY is missing');
}

const client = new OpenAICompatibleClient({ apiKey, model, baseURL });
const rawClient = new OpenAI({
  apiKey,
  baseURL: baseURL || 'https://api.openai.com/v1',
});

function parseJsonOnly(text) {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function summarizeResults(sampleRuns) {
  const summary = {
    sampleCount: sampleRuns.length,
    validateSampleCount: sampleRuns.filter((run) => run.taskMode === 'validate').length,
    summarizeSampleCount: sampleRuns.filter((run) => run.taskMode === 'summarize').length,
    directStrategy: {
      jsonParseSuccesses: 0,
      markdownSuccesses: 0,
      totalElapsedMs: 0,
      totalTokens: 0,
    },
    semanticFirstStrategy: {
      jsonParseSuccesses: 0,
      markdownSuccesses: 0,
      totalElapsedMs: 0,
      totalTokens: 0,
    },
  };

  for (const run of sampleRuns) {
    if (run.directStrategy.jsonParseSuccess) summary.directStrategy.jsonParseSuccesses += 1;
    if (run.directStrategy.markdownPresent) summary.directStrategy.markdownSuccesses += 1;
    summary.directStrategy.totalElapsedMs += run.directStrategy.elapsedMs;
    summary.directStrategy.totalTokens += run.directStrategy.usage?.totalTokens || 0;

    if (run.semanticFirstStrategy.jsonParseSuccess)
      summary.semanticFirstStrategy.jsonParseSuccesses += 1;
    if (run.semanticFirstStrategy.markdownPresent)
      summary.semanticFirstStrategy.markdownSuccesses += 1;
    summary.semanticFirstStrategy.totalElapsedMs += run.semanticFirstStrategy.elapsedMs;
    summary.semanticFirstStrategy.totalTokens += run.semanticFirstStrategy.usage?.totalTokens || 0;
  }

  return {
    sampleCount: summary.sampleCount,
    validateSampleCount: summary.validateSampleCount,
    summarizeSampleCount: summary.summarizeSampleCount,
    directStrategy: {
      jsonParseSuccessRate:
        summary.sampleCount === 0
          ? 0
          : summary.directStrategy.jsonParseSuccesses / summary.sampleCount,
      markdownSuccessRate:
        summary.sampleCount === 0
          ? 0
          : summary.directStrategy.markdownSuccesses / summary.sampleCount,
      averageElapsedMs:
        summary.sampleCount === 0 ? 0 : summary.directStrategy.totalElapsedMs / summary.sampleCount,
      averageTotalTokens:
        summary.sampleCount === 0 ? 0 : summary.directStrategy.totalTokens / summary.sampleCount,
    },
    semanticFirstStrategy: {
      jsonParseSuccessRate:
        summary.sampleCount === 0
          ? 0
          : summary.semanticFirstStrategy.jsonParseSuccesses / summary.sampleCount,
      markdownSuccessRate:
        summary.sampleCount === 0
          ? 0
          : summary.semanticFirstStrategy.markdownSuccesses / summary.sampleCount,
      averageElapsedMs:
        summary.sampleCount === 0
          ? 0
          : summary.semanticFirstStrategy.totalElapsedMs / summary.sampleCount,
      averageTotalTokens:
        summary.sampleCount === 0
          ? 0
          : summary.semanticFirstStrategy.totalTokens / summary.sampleCount,
    },
  };
}

function buildLatestSummaryMarkdown(run) {
  const lines = [
    '# Phase 5 Live Benchmark',
    '',
    `- Generated At: ${run.generatedAt}`,
    `- Provider: ${run.provider}`,
    `- Model: ${run.model || 'default'}`,
    `- Samples: ${run.summary.sampleCount}`,
    `- Validate Samples: ${run.summary.validateSampleCount}`,
    `- Summarize Samples: ${run.summary.summarizeSampleCount}`,
    `- Benchmark Kind: composite strategy benchmark`,
    `- Baseline Strategy: direct`,
    `- Candidate Strategy: semantic_first`,
    '',
    '## Aggregate',
    '',
    `- Direct strategy JSON success: ${run.summary.directStrategy.jsonParseSuccessRate}`,
    `- Semantic-first strategy JSON success: ${run.summary.semanticFirstStrategy.jsonParseSuccessRate}`,
    `- Direct strategy markdown success: ${run.summary.directStrategy.markdownSuccessRate}`,
    `- Semantic-first strategy markdown success: ${run.summary.semanticFirstStrategy.markdownSuccessRate}`,
    `- Direct strategy avg elapsed ms: ${run.summary.directStrategy.averageElapsedMs}`,
    `- Semantic-first strategy avg elapsed ms: ${run.summary.semanticFirstStrategy.averageElapsedMs}`,
    `- Direct strategy avg total tokens: ${run.summary.directStrategy.averageTotalTokens}`,
    `- Semantic-first strategy avg total tokens: ${run.summary.semanticFirstStrategy.averageTotalTokens}`,
    '',
    '## Samples',
    '',
  ];

  for (const sample of run.samples) {
    lines.push(`### ${sample.scenarioId}`);
    lines.push(`- Sample: ${sample.sample}`);
    lines.push(`- Task mode: ${sample.taskMode}`);
    lines.push(`- Prompt tier: ${sample.promptTier}`);
    lines.push(`- Direct strategy json: ${sample.directStrategy.jsonParseSuccess}`);
    lines.push(`- Direct strategy markdown: ${sample.directStrategy.markdownPresent}`);
    lines.push(`- Direct strategy elapsed ms: ${sample.directStrategy.elapsedMs}`);
    lines.push(`- Direct strategy total tokens: ${sample.directStrategy.usage?.totalTokens || 0}`);
    lines.push(`- Semantic-first strategy json: ${sample.semanticFirstStrategy.jsonParseSuccess}`);
    lines.push(
      `- Semantic-first strategy markdown: ${sample.semanticFirstStrategy.markdownPresent}`,
    );
    lines.push(`- Semantic-first strategy elapsed ms: ${sample.semanticFirstStrategy.elapsedMs}`);
    lines.push(
      `- Semantic-first strategy total tokens: ${sample.semanticFirstStrategy.usage?.totalTokens || 0}`,
    );
    lines.push('');
  }

  return lines.join('\n');
}

function normalizeRuleViolations(rawViolations) {
  if (!Array.isArray(rawViolations)) {
    return [];
  }

  return rawViolations
    .map((violation) => {
      if (!violation || typeof violation !== 'object') {
        return null;
      }

      const id =
        typeof violation.id === 'string'
          ? violation.id
          : typeof violation.rule === 'string'
            ? violation.rule
            : typeof violation.ruleId === 'string'
              ? violation.ruleId
              : null;
      if (!id) {
        return null;
      }

      const severity = typeof violation.severity === 'string' ? violation.severity : 'warning';
      const reason =
        typeof violation.reason === 'string'
          ? violation.reason
          : typeof violation.message === 'string'
            ? violation.message
            : typeof violation.description === 'string'
              ? violation.description
              : 'No reason provided.';

      return { id, severity, reason };
    })
    .filter((violation) => violation !== null);
}

async function runSample(config) {
  const absolutePath = path.join(rootDir, config.samplePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  const skeleton = await extractor.extract(content, config.samplePath);

  const artifacts = buildSourcePromptArtifacts({
    content,
    skeleton,
    dependencyContext: config.dependencyContext,
    ruleData: config.ruleData,
    previousSemantic: config.previousSemantic,
    taskMode: config.taskMode,
    promptTier: config.promptTier,
  });

  const startedDirect = Date.now();
  const direct = await client.generateSummary(
    config.samplePath,
    artifacts.fileInput,
    artifacts.contextData,
    artifacts.ruleData,
    'phase5 live benchmark',
    ['English'],
    'main',
    `M ${config.samplePath}`,
    artifacts.previousSemantic,
    config.promptTier,
    'source',
    config.taskMode,
  );
  const directElapsedMs = Date.now() - startedDirect;

  const jsonOnlyPrompt = [
    `You are an expert ${config.taskMode === 'validate' ? 'architecture audit' : 'code understanding'} assistant.`,
    'Return only valid JSON. No markdown fences. No explanations.',
    'The JSON must match this schema exactly:',
    JSON.stringify(
      {
        semantic: {
          role: '...',
          responsibilities: [],
          outOfScope: [],
          invariants: [],
          ruleViolations: [],
          changeIntent: { architecturalIntent: '...', recentChangeIntent: '...' },
          publicSurface: [],
          driftDetected: false,
          driftReason: null,
        },
        graph: { dependsOn: [{ targetPath: '...', relation: 'import', symbols: [] }] },
      },
      null,
      2,
    ),
    '',
    'FILE INPUT:',
    artifacts.fileInput,
    '',
    'DEPENDENCY CONTEXT:',
    artifacts.contextData,
    '',
    artifacts.ruleData ? `RULES:\n${artifacts.ruleData}\n` : '',
    'PREVIOUS SEMANTIC:',
    JSON.stringify(artifacts.previousSemantic || {}, null, 2),
  ].join('\n');

  const startedSemanticFirst = Date.now();
  const stage1 = await rawClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'You are an expert developer assistant.' },
      { role: 'user', content: jsonOnlyPrompt },
    ],
    temperature: 0.1,
  });
  const stage1Content = stage1.choices?.[0]?.message?.content || '';
  const parsedStage1 = parseJsonOnly(stage1Content);

  const markdownOnlyPrompt = [
    'You are a technical documentation writer.',
    'Generate English markdown only. No JSON. No code fences.',
    `Target file: ${config.samplePath}`,
    'Use this semantic JSON as the source of truth:',
    parsedStage1.ok ? JSON.stringify(parsedStage1.data, null, 2) : stage1Content,
  ].join('\n');

  const stage2 = await rawClient.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'You are an expert developer assistant.' },
      { role: 'user', content: markdownOnlyPrompt },
    ],
    temperature: 0.1,
  });
  const semanticFirstElapsedMs = Date.now() - startedSemanticFirst;
  const semanticFirstMarkdown = stage2.choices?.[0]?.message?.content || '';
  const normalizedDirectRuleViolations = normalizeRuleViolations(
    direct.json?.semantic?.ruleViolations,
  );
  const normalizedSemanticFirstRuleViolations = parsedStage1.ok
    ? normalizeRuleViolations(parsedStage1.data?.semantic?.ruleViolations)
    : [];

  return {
    scenarioId: config.scenarioId,
    sample: config.samplePath,
    taskMode: config.taskMode,
    promptTier: config.promptTier,
    directStrategy: {
      elapsedMs: directElapsedMs,
      jsonParseSuccess: Boolean(direct.json && direct.json.semantic),
      markdownPresent: Boolean(direct.markdown?.English),
      usage: direct.usage || null,
      ruleViolations: normalizedDirectRuleViolations,
    },
    semanticFirstStrategy: {
      elapsedMs: semanticFirstElapsedMs,
      jsonParseSuccess: parsedStage1.ok,
      markdownPresent: Boolean(semanticFirstMarkdown),
      usage: {
        inputTokens: (stage1.usage?.prompt_tokens || 0) + (stage2.usage?.prompt_tokens || 0),
        outputTokens:
          (stage1.usage?.completion_tokens || 0) + (stage2.usage?.completion_tokens || 0),
        totalTokens: (stage1.usage?.total_tokens || 0) + (stage2.usage?.total_tokens || 0),
      },
      stage1Preview: stage1Content.slice(0, 240),
      stage2Preview: semanticFirstMarkdown.slice(0, 240),
      ruleViolations: normalizedSemanticFirstRuleViolations,
    },
  };
}

ensureDir(logsDir);

const samples = [];
for (const config of sampleConfigs) {
  const result = await runSample(config);
  samples.push(result);
}

const run = {
  generatedAt: new Date().toISOString(),
  provider,
  model,
  sampleCount: samples.length,
  samples,
  summary: summarizeResults(samples),
};

const timestamp = run.generatedAt.replace(/[:.]/g, '-');
const timestampedLogPath = path.join(logsDir, `PHASE5-LIVE-BENCHMARK-${timestamp}.json`);
fs.writeFileSync(timestampedLogPath, JSON.stringify(run, null, 2));

let cumulative = { runs: [] };
if (fs.existsSync(cumulativeLogPath)) {
  try {
    cumulative = JSON.parse(fs.readFileSync(cumulativeLogPath, 'utf8'));
  } catch {
    cumulative = { runs: [] };
  }
}
cumulative.runs.push({
  generatedAt: run.generatedAt,
  provider: run.provider,
  model: run.model,
  sampleCount: run.sampleCount,
  logFile: path.relative(rootDir, timestampedLogPath),
  summary: run.summary,
});
fs.writeFileSync(cumulativeLogPath, JSON.stringify(cumulative, null, 2));
fs.writeFileSync(latestSummaryPath, buildLatestSummaryMarkdown(run));

console.log(
  JSON.stringify(
    {
      logFile: path.relative(rootDir, timestampedLogPath),
      cumulativeLogFile: path.relative(rootDir, cumulativeLogPath),
      latestSummaryFile: path.relative(rootDir, latestSummaryPath),
      run,
    },
    null,
    2,
  ),
);
