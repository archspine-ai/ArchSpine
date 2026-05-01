<!-- spine-content-hash:a115e138281e676deefcb7c9a7d34c1fbc820e3bd0bac8b496b27ecafa9fc6e2 -->
# ArchSpine – RuntimeService 单元测试套件

## 角色
这是 RuntimeService 的 Vitest 单元测试套件，用于验证 LLM 配置解析、密钥注入和运行时覆盖行为。

## 主要职责
- 为每个测试创建隔离的临时目录，防止测试用例之间的副作用。
- 模拟 Config 和 Secrets 实例，以控制 LLM 提供商、模式、提示层级、验证策略和 API 密钥。
- 断言 RuntimeService.getResolvedLLMSettings() 正确反映配置覆盖（提供商、模式、提示层级、验证策略）。
- 验证运行时覆盖被正确应用，并且通过 afterEach 清理不会在测试边界之间泄漏。
- 导入并执行 resolveExecutionProfileFromSettings，以验证从 LLM 设置派生的执行配置文件。

## 重要不变项与排除范围
- **不变项：**  
  - 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。  
  - 每个测试必须创建并清理自己的临时目录以确保隔离。  
  - RuntimeService 必须在应用配置覆盖后反映最新的覆盖值。
- **排除范围：**  
  - 不测试 getResolvedLLMSettings 之外的 RuntimeService 方法。  
  - 不测试数据库交互、文件扫描或清单操作。  
  - 不测试错误处理路径或无效配置的边缘情况。  
  - 不测试与实际 LLM 提供商或凭据后端的集成。

## 最重要的导出行为
- `describe('RuntimeService')` – 测试套件容器。
- `beforeEach` 钩子 – 设置模拟对象和临时目录。
- `afterEach` 钩子 – 清理状态以防止泄漏。
- `it('should resolve LLM settings with overrides')` – 主要测试用例，验证配置覆盖的传播。