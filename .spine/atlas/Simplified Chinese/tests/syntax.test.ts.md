<!-- spine-content-hash:051e41f128940525c2b8ea8a48969956b014c0f950192c29cfc3c0e670c75d57 -->
# ArchSpine – FixTask 语法验证测试套件

本 Vitest 单元测试套件用于验证 `FixTask.validateSyntax` 方法中的 TypeScript 语法防护逻辑。它确保该方法能正确接受有效的 TypeScript 代码并拒绝无效代码。

## 主要职责

- 使用有效和无效的 TypeScript 代码样本测试 `FixTask.validateSyntax` 方法。
- 断言有效的 TypeScript 代码通过语法验证。
- 断言无效的 TypeScript 代码未通过语法验证。

## 关键不变条件

- 必须从 Vitest 导入 `describe`、`it`、`expect`。
- 必须从 `../src/tasks/fix.js` 导入 `FixTask`。
- 必须在 `FixTask` 实例上调用 `validateSyntax`。
- 必须使用 `expect` 断言来验证结果。

## 不涉及范围

- 不测试 `FixTask` 中除 `validateSyntax` 之外的其他方法。
- 不进行与外部系统的集成测试。
- 不进行语法验证的性能或负载测试。

## 导出的行为

该套件不导出任何公共接口，仅作为测试运行器。它验证了 `FixTask` 在进一步处理前强制检查 TypeScript 语法正确性的核心不变条件。