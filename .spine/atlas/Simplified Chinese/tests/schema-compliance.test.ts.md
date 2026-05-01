<!-- spine-content-hash:d18ed7f0455a9c3997b72f4de7bc8a868465de7277200ba225fbb48586efbb9b -->
# ArchSpine 集成测试套件

本 Vitest 集成测试套件用于验证 ArchSpine 的 JSON 模式验证与同步服务编排功能，确保核心系统组件在隔离、确定性的环境中正确协同工作。

## 主要职责

- **模式验证**：使用启用了 `allErrors` 和 `formats` 的 Ajv 验证 Spine 单元和共享 JSON 模式，确保模式正确性。
- **同步服务测试**：通过模拟 LLM 客户端测试 SyncService 集成，将测试与外部 AI 服务隔离。
- **测试环境管理**：为模式验证和同步夹具创建并清理临时目录和文件。
- **索引文件合规性**：确保 `.spine/index` 目录中的所有索引文件符合 Spine 单元模式。

## 不涉及范围

- UI 组件或前端渲染测试
- 直接数据库持久化或 ORM 层测试
- SyncService 之外的生产 API 端点集成
- ArchSpine 系统的性能或负载测试

## 不变约束

- 必须是 Vitest 测试文件（`.test.ts` 后缀）
- 依赖 `spine-unit.schema.json` 和 `shared.schema.json` 进行验证
- 使用模拟的 LLM 客户端将测试与外部 AI 服务隔离
- 在测试执行期间创建并清理临时目录

## 架构意图

为核心 ArchSpine 模式验证和同步服务提供隔离、确定性的集成测试，确保系统一致性和契约遵守。最近的变更重点是通过 LLM/数据库解耦和引擎冒烟测试来强化风险热点。