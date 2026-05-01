<!-- spine-content-hash:f8078d56709a4f23b4a931125d81a6e7f2f97226f43c7b1a4955a1a302365bcf -->
# ArchSpine – LLM 外观单元测试套件

## 角色
这是一个 Vitest 单元测试套件，用于验证 LLM 外观基础设施模块的结构完整性和公共 API 表面。

## 主要职责
- 断言 LLM 外观模块导出所需的公共符号：`GlobalLLMConfig`、`GlobalLLMSecrets`、`getGlobalArchSpineDir`、`createResolvedLLMClient` 和 `resolveLLMSettings`。
- 验证外观模块中没有任何导出的符号是 `undefined`，从而为消费者确保稳定的 API 契约。

## 不涉及范围
- 测试 LLM 外观的功能行为或运行时逻辑。
- 验证与外部 LLM 提供商或数据库系统的集成。
- 对 LLM 基础设施进行性能或负载测试。

## 重要不变性
- 测试文件后缀必须为 `.test.ts` 或 `.spec.ts`（遵循项目规则）。

## 最重要的导出行为
该测试套件确保 LLM 外观模块公开一组定义明确、稳定的公共符号。任何导致导出符号被移除、重命名或变为 `undefined` 的更改都会导致这些测试失败，从而提醒开发者注意破坏性的 API 变更。