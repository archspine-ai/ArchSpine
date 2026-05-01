<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/__mocks__","role":"This directory provides the public API surface for LLM provider mocking infrastructure.","responsibility":"Exposes the MockClient class as a stable public export from the internal LLM provider mocking implementation, enabling consumers to mock LLM providers in tests and development environments.","children":[{"filePath":"src/infra/__mocks__/llm.ts","role":"Infrastructure facade module providing a public re-export of the MockClient for LLM provider mocking.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.345Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/__mocks__` — LLM 提供者模拟公共 API

该目录作为 ArchSpine 系统中 LLM 提供者模拟基础设施的公共 API 表面。其主要职责是将 `MockClient` 类作为稳定的、可导入的导出项，从内部 LLM 提供者模拟实现中暴露出来。这使得消费者（如测试套件和开发环境）能够模拟 LLM 提供者，而无需依赖内部实现细节。

该目录包含一个值得注意的子模块：

- **`llm.ts`** — 一个基础设施外观模块，从底层模拟实现中重新导出 `MockClient`。该模块作为获取模拟 LLM 客户端的唯一入口点，确保了公共 API 与内部模拟逻辑之间的清晰分离。

此处最重要的实现领域是 `MockClient` 接口的稳定性以及重新导出模式的简洁性。通过保持公共表面最小化，该目录减少了耦合，并使消费者能够轻松采用模拟，而无需理解内部提供者层次结构。