<!-- spine-content-hash:ac3628973b3fcecb3b73d4eb1e215b29288276a21b4f3375230b4e70640e9604 -->
# DocumentationRenderer 测试套件

本 Vitest 单元测试套件用于验证 ArchSpine 基础设施层中的 `DocumentationRenderer` 组件。其主要目的是确保渲染器能够按照系统的文档生成需求，输出正确的 Markdown 内容并正确处理本地化。

## 主要职责

- **隔离测试环境**：每个测试用例都会创建一个临时目录，避免副作用并确保状态干净。
- **输出验证**：验证 `DocumentationRenderer.render` 能够生成结构正确的英文和本地化输出。
- **辅助函数测试**：测试 `renderExtraSections` 和 `renderStructureList` 的格式正确性。
- **清理保证**：每个测试结束后，恢复原始工作目录并删除所有临时文件。

## 重要不变性

- 测试套件仅使用 Vitest 测试框架。
- 每个测试后必须清理临时目录。
- 测试不会修改 `DocumentationRenderer` 的源代码实现。

## 不涉及范围

- 生产渲染逻辑（由 `DocumentationRenderer` 自身负责）。
- 隔离测试目录之外的文件系统操作。
- 与其他系统组件的集成测试。

## 公开接口

以下函数是验证的主要目标：

- `DocumentationRenderer.render`
- `renderExtraSections`
- `renderStructureList`

## 变更意图

架构意图是确保文档渲染器生成正确的 Markdown 并正确处理本地化。最近的变更恢复了由 LLM 编写的 Markdown 生成能力，本测试套件已更新以验证该恢复功能。