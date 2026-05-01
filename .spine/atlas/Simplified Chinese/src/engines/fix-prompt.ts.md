<!-- spine-content-hash:a543bd17f4a1c00f1a90026d6114c9ca788bcfc86afd4e457fa9bdc55c0e6dab -->
# ArchSpine – 修复违规提示生成器

## 角色
用于架构违规修复的 LLM 提示模板生成器。

## 主要职责
- 定义 `FixViolationContext` 数据结构，捕获生成修复提示所需的所有违规上下文。
- 将违规详情和文件上下文格式化为结构化的指令提示，供 LLM 助手使用。

## 重要不变性
- 必须导出 `FixViolationContext` 接口以保证类型安全。
- 必须导出 `generateFixPrompt` 函数作为主要公共 API。
- 必须保持与 CLI 入口点和服务编排的解耦，遵循引擎独立性规则。

## 负面范围（不包含）
- **不**直接修复违规——仅生成供 LLM 使用的提示。
- **不**编排修复应用过程。
- **不**导入 CLI 入口点或服务级模块。

## 最重要的导出/外部可见行为
- **`FixViolationContext`** – 定义违规上下文数据形状的接口。
- **`generateFixPrompt`** – 接收 `FixViolationContext` 并返回格式化提示字符串的函数。

## 架构意图
提供一个可复用、类型安全的提示生成工具，用于通过 LLM 自动修复架构违规。该模块是更广泛的风险热点强化工作的一部分，实现了 LLM/数据库解耦，支持基于 LLM 的修复生成，而无需直接耦合到修复应用或编排逻辑。