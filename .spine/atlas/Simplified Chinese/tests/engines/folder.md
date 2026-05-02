<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/engines","role":"This directory contains the test suite for the Scanner engine.","responsibility":"The test suite validates the Scanner engine's file discovery behavior by creating isolated temporary directories, generating synthetic file system fixtures, invoking the Scanner with a resolved scan policy, and asserting correct inclusion and exclusion of files based on ignore patterns.","children":[{"filePath":"tests/engines/scanner.test.ts","role":"Vitest integration test suite for the Scanner engine's smoke and file discovery behavior.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:52.287Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# tests/engines – 扫描引擎测试套件

本目录存放了 ArchSpine 项目中扫描引擎的完整测试套件。扫描引擎负责文件发现工作，该套件验证扫描器能否正确遍历目录、遵循忽略模式，并根据解析后的扫描策略准确包含或排除文件。

当前目录仅包含一个集成测试文件：

- **scanner.test.ts** – 基于 Vitest 的集成测试文件，验证扫描器的冒烟测试场景以及详细的文件发现行为。它通过创建临时目录、生成模拟文件系统、使用已配置的策略调用扫描器，并断言结果是否符合预期的包含与排除模式来隔离测试。

本套件覆盖的关键实现领域包括：
- 临时目录的创建与隔离。
- 用于确定性测试环境的模拟文件系统生成。
- 策略解析及其对文件列表的影响。
- glob 模式、忽略规则及嵌套目录遍历的边界情况。

该测试套件对于确保扫描引擎在高层次组件使用之前行为正确至关重要。