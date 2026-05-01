import * as fs from 'fs';
import * as path from 'path';
import { generateMarkdownPrompt } from '../infra/prompt.js';
import type { LLMClient, UsageInfo } from '../infra/llm.js';
import type { FileKind, SpineFolderUnit, SpineProjectUnit, SpineUnit } from '../types/protocol.js';
import { parseMarkdownBlocks } from '../infra/llm/providers/utils.js';
import { FileSystemManager } from '../utils/fs.js';
import pLimit from 'p-limit';

const HASH_PREFIX = '<!-- spine-content-hash:';

function readMarkdownHash(content: string): string | undefined {
  const firstLine = content.split('\n', 1)[0] || '';
  const match = firstLine.match(/^<!-- spine-content-hash:([a-f0-9]+) -->$/i);
  return match?.[1];
}

function withMarkdownHash(contentHash: string, markdown: string): string {
  return `${HASH_PREFIX}${contentHash} -->\n${markdown}`;
}

function collectJsonFiles(rootDir: string): string[] {
  const results: string[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) {
      return;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        results.push(fullPath);
      }
    }
  };
  walk(path.join(rootDir, '.spine', 'index'));
  return results;
}

function getDocTarget(
  indexPath: string,
  rootDir: string,
): { type: 'file' | 'folder' | 'project'; relativePath: string } {
  const rel = path.relative(path.join(rootDir, '.spine', 'index'), indexPath);
  if (rel === 'project.json') {
    return { type: 'project', relativePath: '' };
  }
  if (rel.endsWith(`${path.sep}folder.json`)) {
    return { type: 'folder', relativePath: path.dirname(rel) };
  }
  return { type: 'file', relativePath: rel.replace(/\.json$/i, '') };
}

export class DocumentBackfillTask {
  constructor(
    private readonly rootDir: string,
    private readonly llmClient: LLMClient | undefined,
    private readonly targetLocales: string[],
  ) {}

  public async run(): Promise<{ generated: number; skipped: number; usage: UsageInfo }> {
    if (!this.llmClient?.generateText) {
      return {
        generated: 0,
        skipped: 0,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      };
    }

    const usage: UsageInfo = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    let generated = 0;
    let skipped = 0;

    const limit = pLimit(10);
    const jsonFiles = collectJsonFiles(this.rootDir);

    const tasks = jsonFiles.map((jsonPath) =>
      limit(async () => {
        const docTarget = getDocTarget(jsonPath, this.rootDir);
        const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as
          | SpineUnit
          | SpineFolderUnit
          | SpineProjectUnit;
        const contentHash =
          docTarget.type === 'file'
            ? (raw as SpineUnit).identity?.contentHash
            : `${docTarget.type}:${JSON.stringify(raw)}`;

        if (!contentHash) {
          skipped += 1;
          return;
        }

        let needsGeneration = false;
        const targetPaths: Record<string, string> = {};

        for (const locale of this.targetLocales) {
          const targetMdPath =
            docTarget.type === 'project'
              ? path.join(this.rootDir, '.spine', 'atlas', locale, 'project.md')
              : docTarget.type === 'folder'
                ? path.join(
                    this.rootDir,
                    '.spine',
                    'atlas',
                    locale,
                    docTarget.relativePath,
                    'folder.md',
                  )
                : path.join(
                    this.rootDir,
                    '.spine',
                    'atlas',
                    locale,
                    `${docTarget.relativePath}.md`,
                  );
          targetPaths[locale] = targetMdPath;

          const existing = fs.existsSync(targetMdPath)
            ? fs.readFileSync(targetMdPath, 'utf-8')
            : '';
          if (readMarkdownHash(existing) !== contentHash) {
            needsGeneration = true;
          }
        }

        if (!needsGeneration) {
          skipped += this.targetLocales.length;
          return;
        }

        const semanticJson = docTarget.type === 'file' ? (raw as SpineUnit).semantic : raw;
        const fileKind: FileKind | 'project' =
          docTarget.type === 'project'
            ? 'project'
            : docTarget.type === 'folder'
              ? 'folder'
              : 'source';

        const prompt = generateMarkdownPrompt({
          identifier:
            docTarget.type === 'file'
              ? docTarget.relativePath
              : docTarget.relativePath || 'project',
          fileKind,
          semanticJson,
          languages: this.targetLocales,
        });

        try {
          const translated = await this.llmClient!.generateText!(prompt);
          usage.inputTokens += translated.usage?.inputTokens || 0;
          usage.outputTokens += translated.usage?.outputTokens || 0;
          usage.totalTokens += translated.usage?.totalTokens || 0;
          const markdownBlocks = parseMarkdownBlocks(translated.content, this.targetLocales);

          for (const locale of this.targetLocales) {
            const mdContent = markdownBlocks[locale];
            if (!mdContent) {
              continue;
            }
            const targetMdPath = targetPaths[locale];

            const existing = fs.existsSync(targetMdPath)
              ? fs.readFileSync(targetMdPath, 'utf-8')
              : '';
            if (readMarkdownHash(existing) === contentHash) {
              skipped += 1;
              continue;
            }

            FileSystemManager.safeWriteFile(targetMdPath, withMarkdownHash(contentHash, mdContent));
            generated += 1;
          }
        } catch (err) {
          // eslint-disable-next-line no-console -- Backfill error diagnostic
          console.error(`[Backfill] Failed to generate docs for ${jsonPath}:`, err);
        }
      }),
    );

    await Promise.all(tasks);

    return { generated, skipped, usage };
  }
}
