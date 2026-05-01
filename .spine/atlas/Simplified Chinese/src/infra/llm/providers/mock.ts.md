<!-- spine-content-hash:cfbfbcb89c3acf3452b2b3bab10de2b34a721b1d1514b14ae22a41c08cd01eaa -->
# MockClient – 测试基础设施模拟 LLM 客户端

## 角色
该文件提供了一个 LLMClient 接口的模拟实现，旨在模拟 LLM 提供商的响应，用于单元测试和集成测试。它支持确定性、可重复的测试场景，无需依赖外部 LLM 服务。

## 主要职责
- 实现 `LLMClient` 接口，提供确定性测试场景下的模拟行为。
- 从模拟 LLM 响应中解析规则块数据，以模拟架构规则验证。
- 在模拟响应中检测模拟的架构违规，用于测试规则引擎。
- 提供可配置的模拟响应，用于测试提示处理和验证管道。

## 重要不变性与负面范围
- **必须**实现来自 `../base.js` 的 `LLMClient` 接口。
- **不得**引入真实的网络调用或外部依赖。
- **必须**支持确定性模拟响应生成，以确保测试可重复性。
- **不涉及：** 真实的 LLM 提供商集成、生产级别的提示处理、持久化状态管理或响应缓存。

## 公开接口（导出）
- `MockClient` 类（导出）
- `constructor(_config: ProviderConfig)`
- `extractRuleBlocks(ruleData?: string): Array<{ id: string; severity: string; body: string }>`
- `detectMockViolations(ruleData: string): Array<{ id: string; severity: string; reason: string }>`