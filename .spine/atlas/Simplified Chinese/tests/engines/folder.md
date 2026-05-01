<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/engines","role":"This directory contains the test suite for the Scanner engine.","responsibility":"The test suite validates the Scanner engine's file discovery behavior by creating isolated temporary directories, generating synthetic file system fixtures, invoking the Scanner with a resolved scan policy, and asserting correct inclusion and exclusion of files based on ignore patterns.","children":[{"filePath":"tests/engines/scanner.test.ts","role":"Vitest integration test suite for the Scanner engine's smoke and file discovery behavior.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.287Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# tests/engines – 扫描引擎测试套件

此目录包含 ArchSpine 系统中负责文件发现的扫描引擎的测试套件。测试通过创建隔离的临时目录、生成合成文件系统结构、使用已解析的扫描策略调用扫描器，并基于忽略模式断言文件的正确包含与排除来验证引擎行为。

该目录目前包含一个测试文件：

- **scanner.test.ts** – 一个 Vitest 集成测试套件，涵盖冒烟测试和详细的文件发现行为。此文件是验证扫描引擎核心逻辑的主要实现区域。

该测试套件对于确保扫描引擎正确遵循忽略模式并在各种目录结构下生成预期的文件列表至关重要。