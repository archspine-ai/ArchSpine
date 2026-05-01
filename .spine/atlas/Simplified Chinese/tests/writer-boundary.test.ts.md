<!-- spine-content-hash:56433867829cce8f7e6879d3da00d2e6e96453d978db84a0e1f6a0c7662fce03 -->
# SpineWriterBoundary 集成测试套件

该 Vitest 集成测试套件用于验证 `SpineWriterBoundary` 组件的写入保护与文件系统交互行为，确保文件系统写入操作得到正确防护，防止意外修改。

## 主要职责

- 创建隔离的临时目录和文件，模拟真实文件系统场景。
- 测试 `SpineWriterBoundary` 对受保护输出目录写入权限的强制执行。
- 验证 `withProtectedOutputsWriteAccess` 装饰器在允许或拒绝文件修改时的行为。
- 确认文件系统操作遵循边界访问控制规则。

## 关键不变性

- 必须使用 Vitest 作为测试框架。
- 必须将测试工件隔离在临时目录中。
- 必须同时测试允许和拒绝的写入场景。

## 不涉及范围

- 测试隔离之外的生成环境文件系统操作。
- 修改 `SpineWriterBoundary` 的核心实现。
- 测试其他组件或系统边界。

## 架构意图

确保文件系统写入操作由 `SpineWriterBoundary` 正确防护，以防止意外修改。