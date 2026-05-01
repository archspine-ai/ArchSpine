<!-- spine-content-hash:72189f54203c021f2affa1a1267008d21e5111c81d0229fcb0857ae9fec59df6 -->
# ArchSpine 公共 API 外观模块

本模块是 ArchSpine 镜像系统中所有提示生成资源的**单一公共入口点**。它从三个内部模块（`schemas.js`、`blocks.js` 和 `examples.js`）聚合并重新导出符号。

## 角色

作为公共 API 外观，集中提供对 JSON 模式、提示块渲染函数以及源角色定义示例数据的访问。

## 主要职责

- **集中导出**所有 ArchSpine 文档类型（源文件、文档、配置、文件夹、项目）的 JSON 模式。
- **集中导出**提示块渲染函数，涵盖身份、指令、上下文、环境、规则违规检查、Git 意图、JSON 模式和源内容。
- **集中导出**源角色定义的示例数据。
- **提供单一导入点**，供下游提示生成模块使用，降低导入复杂度。

## 重要不变性

- **仅导出**从 `./schemas.js`、`./blocks.js` 和 `./examples.js` 导入的符号。
- **不包含任何业务逻辑或转换**——它是一个纯粹的重新导出聚合点。
- **不实现**模式验证、块渲染逻辑、运行时配置，也不处理用户输入或 API 请求。

## 公共表面（导出的符号）

- `sourceFileSchema`、`documentSchema`、`configSchema`、`folderSchema`、`projectSchema`
- `renderIdentityBlock`、`renderInstructionsBlock`、`renderContextBlock`、`renderEnvironmentalContextBlock`、`renderRuleViolationCheckBlock`、`renderGitIntentBlock`、`renderJSONSchemaBlock`、`renderSourceContentBlock`
- `sourceRoleExamples`

## 变更意图

- **架构意图：** 整合提示生成资源的公共接口，简化导入过程。
- **近期变更：** 本文件未检测到任何变更；最近的提交“恢复 LLM 生成的 Markdown”不影响此外观模块。

## 漂移检测

- **检测到漂移：** 否
- **漂移原因：** 无