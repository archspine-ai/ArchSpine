<!-- spine-content-hash:6688209dcf26fbc80000f3eb5249f615fcd1cba45c9faca5a71f5a4abe6257cf -->
# ArchSpine 语言支持类型定义

## 角色
本模块定义了 ArchSpine 镜像系统中语言支持元数据的 TypeScript 类型契约。它提供了数据结构，使得子系统之间能够以类型安全的方式通信关于检测到的编程语言及其扩展的信息。

## 主要职责
- **LanguageSnapshot** – 表示所有检测到的语言及其关联文件扩展名的完整状态。
- **LanguageSupport** – 描述单个编程语言的可用性状态和元数据。
- **LanguageDelta** – 捕获两个语言状态之间的差异，支持变更追踪。

## 重要不变规则
- 所有导出的接口必须遵循 `I` 前缀命名约定（例如 `ILanguageSnapshot`）。当前所有三个接口均违反此规则。

## 排除范围（不负责）
- **不**实现任何检测或处理语言数据的逻辑。
- **不**定义运行时行为或验证逻辑。

## 公开接口
- `LanguageSnapshot`
- `LanguageSupport`
- `LanguageDelta`

## 检测到的漂移
检测到与先前语义契约的漂移：所有三个接口均违反接口前缀规则，而此前并未报告此问题。