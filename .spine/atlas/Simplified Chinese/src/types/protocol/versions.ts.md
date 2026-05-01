<!-- spine-content-hash:40fe341ae5617716f77939a367b9086b4446d4e1f893c908f380cac40ba65bf1 -->
# ArchSpine 版本模块

## 角色
ArchSpine 架构与包版本管理的集中定义模块。

## 主要职责
- 定义 `SchemaVersion` 类型别名，作为语义化版本字符串模板。
- 导出当前包版本、架构版本和配置架构版本的常量。
- 导出标识 ArchSpine 工具链的生成器版本字符串。
- 提供类型守卫函数，用于验证配置架构版本的兼容性。

## 重要不变性与非职责范围
- 所有导出版本常量均为字符串字面量或模板字面量。
- `SchemaVersion` 类型是语义化版本字符串模板字面量。
- `isSupportedConfigSchemaVersion` 是纯类型守卫函数。
- 本模块**不**处理运行时版本管理、动态版本解析、接口定义，或超出版本字符串相等性检查的架构验证。

## 公开接口（导出符号）
- `SchemaVersion`
- `CURRENT_PACKAGE_VERSION`
- `CURRENT_SCHEMA_VERSION`
- `CURRENT_CONFIG_SCHEMA_VERSION`
- `GENERATOR_VERSION`
- `isSupportedConfigSchemaVersion`