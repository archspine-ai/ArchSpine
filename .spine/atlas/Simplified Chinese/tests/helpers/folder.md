<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/helpers","role":"Contains the lock worker script for testing the distributed lock mechanism.","responsibility":"Provides a CLI-based lock worker that acquires, holds, and releases file locks for testing and validation of the ArchSpine distributed lock system, emitting structured JSON status messages for test harness consumption.","children":[{"filePath":"tests/helpers/lock-worker.mjs","role":"Lock worker script for testing and validating the ArchSpine distributed lock mechanism","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.847Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/helpers` — 分布式锁测试的锁工作器

此目录包含一个用于验证 ArchSpine 分布式锁系统的单一、集中的辅助脚本。锁工作器（`lock-worker.mjs`）是一个 CLI 工具，用于获取、持有和释放文件锁，并发出结构化的 JSON 状态消息供测试框架使用。它是验证并发测试场景中锁获取、争用和释放行为的主要测试夹具。

**值得注意的子项：**
- `lock-worker.mjs` — 锁工作器脚本本身，实现了用于测试的完整锁生命周期。

**关键实现领域：**
- 锁获取和释放逻辑
- JSON 状态消息发出
- 用于锁配置的 CLI 参数解析
- 与 ArchSpine 分布式锁机制的集成