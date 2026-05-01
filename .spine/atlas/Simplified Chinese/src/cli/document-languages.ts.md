<!-- spine-content-hash:1711226429b4a81647eafa4846aea73dc79c74e2c8b61ea44d774a17760f9fe9 -->
# ArchSpine – 文档语言配置模块

## 角色
该模块定义了多语言文档层级中语言选择的类型和常量。它作为一个纯配置层，为 UI 组件提供构建语言选项的基础，支持基于层级的分组和质量指导。

## 主要职责
- **接口定义：** 暴露 `DocumentLanguageChoice` 接口，该接口通过标题、值和 UI 状态标志来结构化每个语言选择选项。
- **常量提供：** 提供默认语言集和高容量语言集的常量值（从使用模式推断）。
- **UI 分组：** 导出 `HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE` 和 `HIGH_CAPACITY_LANGUAGE_SEPARATOR`，用于在用户界面中视觉分隔语言层级。
- **用户指导：** 提供 `DOCUMENT_LANGUAGE_QUALITY_NOTE` 常量，用于向用户显示与质量相关的说明。

## 重要不变性与负面范围
- **纯数据层：** 该模块必须保持为无副作用的类型定义和常量集合。不允许包含任何运行时逻辑或状态变更。
- **无下游导入：** 不得导入服务、核心、引擎或基础设施层。
- **范围外：** 明确排除 CLI 命令路由、管道编排、持久化、数据库访问和 UI 渲染。

## 公开表面（导出的符号）
- `DocumentLanguageChoice` – 语言选择选项的接口。
- `HIGH_CAPACITY_LANGUAGE_SEPARATOR_VALUE` – 高容量语言分隔符值的常量。
- `HIGH_CAPACITY_LANGUAGE_SEPARATOR` – 高容量语言分隔符的常量。
- `DOCUMENT_LANGUAGE_QUALITY_NOTE` – 文档质量说明的常量。

## 变更意图
引入该模块是为了集中和类型化多语言文档层级语言选择的配置，使 UI 组件能够一致地渲染带有层级分组和质量指导的语言选项。最近的变更添加了 `DocumentLanguageChoice` 接口及相关常量，以支持层级文档语言选择功能。