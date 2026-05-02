<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/infra","role":"This directory contains test suites for validating index-based recovery and LLM retry mechanisms.","responsibility":"Collectively, these tests ensure the ArchSpine system can recover from corrupted index states and correctly classify LLM errors for retry logic, maintaining data integrity and robust error handling.","children":[{"filePath":"tests/infra/index-recovery.test.ts","role":"Vitest test suite for validating index-based resume recovery and LLM retry mechanisms in the ArchSpine system.","fileKind":"source"},{"filePath":"tests/infra/llm","role":"Test suite for the LLM retry utility's error classification function.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.850Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`tests/infra` 目录专注于验证 ArchSpine 中的两个关键容错子系统：基于索引的恢复机制与 LLM 重试逻辑。该目录下包含两组具体的测试集：

- **index-recovery.test.ts** – 使用 Vitest 编写的测试套件，它验证从损坏或不完整的索引状态中恢复的能力，确保数据完整性可被复原。  
- **llm/** – 此文件夹包含针对 LLM 重试工具的错误分类函数的测试，用于判断哪些 LLM 错误应该触发重试，哪些应该直接暴露。

这些测试共同保证了 ArchSpine 能够在索引管线出现部分故障时优雅地恢复，并能正确决定何时重试 LLM 调用，构成了系统防护层的关键基础。