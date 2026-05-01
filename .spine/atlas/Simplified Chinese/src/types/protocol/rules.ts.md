<!-- spine-content-hash:657fa95295251c9402555e31e76bdf43b157473a3d57d5ce95788779682bcb45 -->
# SpineRuleDocument 接口

## 角色
TypeScript 接口，定义 ArchSpine 规则引擎领域模型中规则文档的规范数据结构。

## 主要职责
- 声明可序列化规则文档的必填和可选字段，包括标识符、元数据、适用性、严重性和内容。
- 通过为 `schemaVersion`、`ruleId`、`title`、`summary`、`appliesTo`、`severity`、`enforceable`、`rationale` 和 `bodyMarkdown` 属性提供类型定义，在 ArchSpine 系统中强制执行一致的规则定义模式。

## 重要不变性与负面范围
- **不变性：** 定义规则文档结构的静态、类型安全契约。作为规则数据交换的主要接口导出。
- **范围外：** 不实现规则验证或执行逻辑。不处理规则文档的解析或序列化。不定义运行时行为或规则执行。

## 最重要的导出行为
- **公共表面：** `SpineRuleDocument` — 规则引擎和扫描子系统之间规则数据交换的主要接口。

## 规则违规
- **interface-prefix（警告）：** 接口 `SpineRuleDocument` 未以内部接口命名规则要求的必需前缀 `I` 开头。

## 漂移检测
- **检测到漂移：** 否
- **漂移原因：** 无