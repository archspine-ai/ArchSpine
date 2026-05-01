<!-- spine-content-hash:957bf17a0440cdb452c45b03aaa2ec12852c9a861fd633f7483a7b4fca1a611c -->
# ArchSpine – LLM 提供者工具函数单元测试

## 角色
该文件是针对 LLM 提供者工具函数（负责解析结构化响应和 Markdown 块）的 Vitest 单元测试套件。

## 主要职责
- 测试 `parseMarkdownBlocks` 函数能否正确提取带有语言标签的 Markdown 块。
- 测试 `parseMarkdownBlocks` 函数对 JSON 块和通用 Markdown 块的处理。
- 测试 `parseStructuredResponse` 函数从结构化 LLM 响应中解析 JSON 和 Markdown 内容。
- 模拟 `console.warn` 以验证在解析格式错误的响应时的警告行为。

## 重要不变性
- 仅使用 Vitest 测试框架（`describe`、`it`、`expect`、`vi`）。
- 每个测试用例遵循 Arrange-Act-Assert（AAA）模式。
- 所有被测试的函数均从 `../src/infra/llm/providers/utils.js` 导入。

## 负面范围（不在范围内）
- **不**测试 `buildSupportingContext` 或 `mergeUsage` 函数（在提供的骨架中已导入但未使用）。
- **不**涵盖 LLM 提供者的集成测试或端到端测试。
- **不**包含性能测试或负载测试。

## 最重要的外部可见行为
该测试套件确保工具函数能够正确解析和提取 LLM 响应中的结构化数据，包括特定语言环境的 Markdown 块、JSON 块和通用 Markdown，同时在遇到格式错误的输入时能够优雅地处理并发出适当的警告。