<!-- spine-content-hash:de548d7cd6cc829d32bad96a6f0a20fffe2eff89525933481bfad1c8a97a3eeb -->
# ArchSpine – 任务状态与文件收集测试套件

## 角色
用于验证任务状态模块和 TypeScript 文件收集工具的 Vitest 单元测试套件。

## 主要职责
- 验证 `createTaskState` 函数在给定操作模式下返回预期的键。
- 确保 `collectTypeScriptFiles` 函数递归遍历目录并筛选 `.ts` 文件。
- 断言 `src/` 和 `tests/` 目录中的所有 TypeScript 源文件均为有效（可解析）的 TypeScript。

## 关键不变条件与负面范围
- 必须导入 vitest 测试工具（`describe`、`expect`、`it`）。
- 必须导入被测试的任务状态模块。
- 必须使用文件系统和路径模块进行测试设置。
- 测试文件后缀必须为 `.test.ts` 或 `.spec.ts`。
- **不涉及范围：** 测试非 TypeScript 文件处理、验证运行时锁防护、性能或集成测试。

## 导出/外部可见行为
此文件不导出任何公共接口；它是一个测试套件，用于执行内部模块并报告通过/失败结果。