<!-- spine-content-hash:016ba421678e07b86c6f6de4b72f1294bab567fc5ac8bbff89d158a8f8b13617 -->
# ArchSpine – 运行时 I/O 外观

## 角色
核心基础设施外观，负责运行时 I/O 操作（日志记录、警告、错误和用户确认）。

## 主要职责
- 定义 `RuntimeIO` 接口，标准化 `info`、`warn`、`error` 和 `confirm` 方法。
- 提供 `defaultRuntimeIO` 实现，使用 `console.log`、`console.warn`、`console.error` 进行日志记录。
- 将用户确认提示委托给导入的 `promptForExplicitConfirmation` 工具。
- 集中管理 I/O 操作，以便支持测试模拟并在整个应用中保持一致的运行时行为。

## 重要不变性
- 为 I/O 操作提供稳定的外观（`RuntimeIO` 接口）。
- 基础设施调用方应依赖此外观，而不是直接访问控制台或确认逻辑的深层私有实现路径。

## 排除范围（不负责）
- 编排服务/任务/引擎工作流。
- 提供高级业务逻辑或领域特定操作。
- 处理网络 I/O、文件系统操作或超出控制台和用户提示的其他底层系统交互。

## 最重要的导出行为
- **`RuntimeIO`** – 所有运行时 I/O 消费者应依赖的接口。
- **`defaultRuntimeIO`** – 默认实现，将日志输出到控制台并将确认委托给 `promptForExplicitConfirmation`。