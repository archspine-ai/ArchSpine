<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"tests/helpers","role":"Contains the lock worker script for testing the distributed lock mechanism.","responsibility":"Provides a CLI-based lock worker that acquires, holds, and releases file locks for testing and validation of the ArchSpine distributed lock system, emitting structured JSON status messages for test harness consumption.","children":[{"filePath":"tests/helpers/lock-worker.mjs","role":"Lock worker script for testing and validating the ArchSpine distributed lock mechanism","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:51.847Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `tests/helpers/` —— 分布式锁测试辅助工具

此目录包含一个用于模拟和验证 ArchSpine 分布式锁机制的独立辅助脚本。唯一文件 `lock-worker.mjs` 是一个基于命令行的锁工人，能够获取、保持（可配置时长）并释放文件锁。

## 结构与分组

由于该辅助集专为锁测试设计，因此仅包含一个模块（无子目录）。分组是扁平且功能性的：锁工人是端到端测试分布式锁系统所需的唯一组件。

## 关键实现领域

- **锁工人 CLI** – 解析命令行参数以指定锁参数，并输出结构化的 JSON 状态消息供测试框架消费。
- **文件锁获取/释放** – 使用系统级文件锁原语来演示和验证 ArchSpine 分布式锁事务的正确行为。
- **与测试套件集成** – 设计为由测试框架直接调用或由集成测试编排。其输出可以传递到断言逻辑或结果收集器中。

该模块对于验证在正常和并发条件下分布式锁操作是否成功至关重要。