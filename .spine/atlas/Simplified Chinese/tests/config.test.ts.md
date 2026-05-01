<!-- spine-content-hash:9c32aa6493ebf4de07d814d80e48f1dd0b8ad8894fd20c304047124b507e29e5 -->
# Config 测试套件

该 Vitest 单元测试套件用于验证 Config 基础设施类的配置持久化及 LLM 提供商/模型设置。

## 职责

- 创建临时目录并设置 `.spine/config.json` 路径，用于隔离的配置文件测试。
- 在每个测试后清理临时目录并取消模拟环境变量。
- 测试当没有配置文件时 `hasPersistedConfig()` 返回 `false`。
- 测试设置 LLM 提供商和模型值后 `hasPersistedConfig()` 返回 `true`。
- 验证 `setLLMProvider` 和 `setLLMModel` 能正确持久化值。
- 验证 `getLLMProvider` 和 `getLLMModel` 返回设置后的预期值。

## 不涉及范围

- 测试与 LLM 提供商/模型或持久化无关的其他 Config 方法。
- 在临时目录之外与实际文件系统进行集成测试。
- 测试 Config 操作的错误处理或边界情况。

## 不变规则

- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。

## 公开接口

- `describe('Config')`
- `beforeEach`
- `afterEach`
- `it('should return false when no config file exists')`
- `it('should persist and retrieve LLM provider and model')`

## 变更意图

架构意图是提供针对 Config 基础设施类的全面测试套件，确保配置持久化和 LLM 设置在隔离环境中正确工作。该套件与最近的提交 "tighten schema handling and add try preview" 无直接关联。