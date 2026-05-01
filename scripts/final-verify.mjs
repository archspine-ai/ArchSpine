/**
 * End-to-end verification: test ASTExtractor against multi-language fixtures
 * with inheritance, generics, bounds, etc.
 */

import { ASTExtractor } from '../dist/ast/extractor.js';

const extractor = new ASTExtractor();

const FIXTURES = {
  java: {
    path: 'src/Fixture.java',
    code: [
      'public class Widget extends BaseWidget { int size = 0; }',
      'public class AuthClient implements AuthInterface, Iface2 { void auth() {} }',
      'class FullService extends BaseService implements Iface1, Iface2 { void run() {} }',
      'public interface IConfig extends Serializable { String getName(); }',
      'interface PlainIface extends BaseIface { void run(); }',
    ].join('\n'),
    expectedExports: ['Widget', 'AuthClient', 'FullService', 'IConfig', 'PlainIface'],
  },
  cpp: {
    path: 'src/fixture.cpp',
    code: [
      'int add(int a, int b) { return a + b; }',
      'class Widget : public BaseWidget { int size = 0; };',
      'class Container : private Base, public Mixin { };',
      'struct Point { int x, y; };',
      'struct Data : Base { int value; };',
      'namespace utils { int helper(); }',
    ].join('\n'),
    expectedExports: ['add', 'Widget', 'Container', 'Point', 'Data', 'utils'],
  },
  rust: {
    path: 'src/fixture.rs',
    code: [
      'fn plain_func() { }',
      'pub fn public_func() -> String { String::new() }',
      'struct Widget<T: Clone> { size: T, }',
      'pub struct Container<T> where T: Debug { items: Vec<T>, }',
      'trait Handler: Send + Sync { fn handle(&self); }',
      'pub trait Reader: std::io::Read { }',
      'impl<T: Clone> Handler for Widget<T> { fn handle(&self) {} }',
      'impl Container<u32> { fn new() -> Self { Container { items: vec![] } } }',
    ].join('\n'),
    expectedExports: [
      'plain_func',
      'public_func',
      'Widget',
      'Container',
      'Handler',
      'Reader',
      'Handler',
      'Container',
    ],
  },
  c: {
    path: 'src/fixture.c',
    code: [
      'int add(int a, int b) { return a + b; }',
      'struct Point { int x, y; };',
      'struct Data { int value; };',
    ].join('\n'),
    expectedExports: ['add', 'Point', 'Data'],
  },
  python: {
    path: 'src/fixture.py',
    code: [
      'def greet(name: str) -> str: return f"Hello {name}"',
      'class Widget(BaseWidget): pass',
      'async def fetch(url: str) -> dict: return {}',
      '__all__ = ["greet", "Widget"]',
    ].join('\n'),
    expectedExports: ['greet', 'Widget', 'fetch', 'greet', 'Widget'],
  },
  go: {
    path: 'src/fixture.go',
    code: [
      'func Add(a, b int) int { return a + b }',
      'type Widget struct { Size int }',
      'type IReader interface { Read() }',
      'type Alias = int',
    ].join('\n'),
    expectedExports: ['Add', 'Widget', 'IReader', 'Alias'],
  },
};

async function main() {
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [lang, fixture] of Object.entries(FIXTURES)) {
    console.log(`\n=== ${lang.toUpperCase()} ===`);
    try {
      const result = await extractor.extract(fixture.code, fixture.path);
      const exportNames = result.exports.map((e) => e.name);
      const missing = fixture.expectedExports.filter((n) => !exportNames.includes(n));
      const extra = exportNames.filter((n) => !fixture.expectedExports.includes(n));

      if (missing.length === 0 && extra.length === 0) {
        console.log(`  PASS: All ${exportNames.length} exports matched`);
        totalPassed++;
      } else {
        if (missing.length > 0) console.log(`  MISSING: ${missing.join(', ')}`);
        if (extra.length > 0) console.log(`  EXTRA: ${extra.join(', ')}`);
        console.log(`  Got: ${exportNames.join(', ')}`);
        console.log(`  Expected: ${fixture.expectedExports.join(', ')}`);
        totalFailed++;
      }

      // Print details
      for (const exp of result.exports) {
        console.log(`    ${exp.name}: ${exp.kind} | ${exp.signature}`);
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
      totalFailed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(`========================================`);

  if (totalFailed > 0) process.exit(1);
}

main();
