<!-- spine-content-hash:b41bd8f3f430e84ab909d1a7d2c58666eb3f891a18d1454a958df35434063e6b -->
# ArchSpine – CLI 帮助命令测试套件

## 角色
针对 CLI 帮助命令边界契约的 Vitest 单元测试套件。

## 主要职责
- 验证 `printCommandHelp` 对 `sync` 命令输出正确的使用语法，并将繁重工作重定向到 `build`。
- 验证 `printGeneralHelp` 输出常规用法，且不包含已弃用的 `--full` 标志。

## 重要不变项与负面范围
- 必须导入 Vitest 测试工具。
- 必须模拟 `console.log` 以捕获输出。
- 必须断言帮助文本中特定字符串的存在与排除。
- **不**实现 CLI 帮助逻辑（委托给 `src/cli/help.ts`）。
- **不**测试非 CLI 组件。
- **不**向用户提供运行时帮助。

## 最重要的导出/外部可见行为
- 确保 CLI 帮助消息在增量同步与完全重建之间保持清晰界限，防止用户混淆。