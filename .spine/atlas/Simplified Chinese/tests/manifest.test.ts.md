<!-- spine-content-hash:ba14ad9b995911688b1496d2144cc9bbc3b88affd00fc845104ba823688ba605 -->
# ArchSpine Manifest 测试套件

## 角色
针对 Manifest 基础设施组件的 Vitest 单元测试套件，通过模拟 SpineDB 来隔离数据库交互。

## 主要职责
- 提供 SpineDB 的模拟实现，无需真实 SQLite 连接即可模拟数据库操作。
- 为 Manifest 实例测试搭建和拆除测试环境。
- 验证 Manifest 在文件状态跟踪、漂移检测和批量操作方面的行为。

## 重要不变性
- 使用 Vitest 作为测试框架。
- 依赖模拟的 SpineDB 方法实现隔离。
- 遵循项目的测试文件命名约定（假定为 `.test.ts`）。

## 排除范围
- 生产数据库连接或真实 SQLite 操作。
- 与外部服务的端到端集成测试。
- UI 或 CLI 层交互。

## 最重要的外部可见行为
该测试套件不导出任何生产代码，纯粹是一个测试工具。其主要外部可见行为是在隔离的模拟条件下验证 Manifest 核心逻辑的正确性。