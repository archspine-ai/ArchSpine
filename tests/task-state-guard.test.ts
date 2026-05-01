import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { createTaskState } from '../src/core/task-state.js';

function collectTypeScriptFiles(rootDir: string): string[] {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(entryPath);
    }
  }

  return files;
}

describe('task state guardrails', () => {
  it('keeps TaskState limited to telemetry payloads', () => {
    expect(Object.keys(createTaskState('off'))).toEqual(['telemetry']);
  });

  it('uses ctx.state and context.state only for telemetry access or explicit resets', () => {
    const repoRoot = process.cwd();
    const files = [
      ...collectTypeScriptFiles(path.join(repoRoot, 'src')),
      ...collectTypeScriptFiles(path.join(repoRoot, 'tests')),
    ].filter((filePath) => !filePath.endsWith('tests/task-state-guard.test.ts'));

    const violations: string[] = [];

    for (const filePath of files) {
      const relativePath = path.relative(repoRoot, filePath);
      const sourceText = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        relativePath,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const aliases = new Set<string>();

      function addViolation(node: ts.Node, message: string): void {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push(`${relativePath}:${line + 1}: ${message}`);
      }

      function isTrackedContextIdentifier(node: ts.Node): node is ts.Identifier {
        return (
          ts.isIdentifier(node) &&
          (node.text === 'ctx' || node.text === 'context' || aliases.has(node.text))
        );
      }

      function isStatePropertyAccess(node: ts.Node): node is ts.PropertyAccessExpression {
        return (
          ts.isPropertyAccessExpression(node) &&
          isTrackedContextIdentifier(node.expression) &&
          node.name.text === 'state'
        );
      }

      function isAllowedStateUse(node: ts.PropertyAccessExpression): boolean {
        const parent = node.parent;
        if (
          ts.isBinaryExpression(parent) &&
          parent.left === node &&
          parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ) {
          return true;
        }
        if (
          ts.isPropertyAccessExpression(parent) &&
          parent.expression === node &&
          parent.name.text === 'telemetry'
        ) {
          return true;
        }
        return false;
      }

      function visit(node: ts.Node): void {
        if (
          ts.isVariableDeclaration(node) &&
          node.initializer &&
          isTrackedContextIdentifier(node.initializer)
        ) {
          if (ts.isIdentifier(node.name)) {
            aliases.add(node.name.text);
          }
          if (ts.isObjectBindingPattern(node.name)) {
            for (const element of node.name.elements) {
              if (
                element.propertyName &&
                ts.isIdentifier(element.propertyName) &&
                element.propertyName.text === 'state'
              ) {
                addViolation(element, 'Do not destructure `state` from TaskContext.');
              }
              if (
                !element.propertyName &&
                ts.isIdentifier(element.name) &&
                element.name.text === 'state'
              ) {
                addViolation(element, 'Do not destructure `state` from TaskContext.');
              }
            }
          }
        }

        if (
          ts.isVariableDeclaration(node) &&
          node.initializer &&
          isStatePropertyAccess(node.initializer)
        ) {
          addViolation(node, 'Do not alias `TaskContext.state`; read telemetry directly.');
        }

        if (
          ts.isPropertyAccessExpression(node) &&
          isStatePropertyAccess(node) &&
          !isAllowedStateUse(node)
        ) {
          addViolation(
            node,
            'Use `TaskContext.state` only for `telemetry` access or explicit state reset.',
          );
        }

        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
    }

    expect(violations).toEqual([]);
  });
});
