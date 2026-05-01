<!-- spine-content-hash:5b462accb6cbbf79112dae24414aaae2104f43eeb71ea54cd23acf1312a7b67d -->
# 足迹稳定性不变量 — 测试规范

本 Vitest 测试套件验证 ArchSpine 同步系统的足迹稳定性不变量在预期条件下是否成立。它是 json-only 同步模式功能的一部分，确保语义短路机制正常工作。

## 角色

用于足迹稳定性不变量的 Vitest 测试规范。

## 主要职责

- 验证 `calculateStructuralFootprint` 在导入/导出顺序噪声下仍能生成相同的哈希值。
- 验证 `calculateSemanticFootprint` 能够检测函数体内容的变化。

## 不涉及范围

- 生产环境中的足迹计算逻辑。
- 与其他系统组件的集成。
- 足迹算法的性能基准测试。

## 重要不变量

- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：test-file-suffix）。

## 导出/外部可见行为

本模块不导出任何公共接口。它仅是一个在 Vitest 框架内运行的测试规范。