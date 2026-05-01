<!-- spine-content-hash:599d9b8a15edc6a5a0771536936a1388d2cbf9d2f6f2c3fbb14280634f8422ea -->
# ArchSpine 默认配置工厂

## 角色
该模块是一个配置工厂，为 ArchSpine 系统提供默认的 `SpineConfig` 对象。它是创建系统其他部分所依赖的基线配置的唯一来源。

## 主要职责
- 构建并返回一个包含预定义值的默认 `SpineConfig` 对象。
- 确保配置始终使用当前架构版本（`CURRENT_CONFIG_SCHEMA_VERSION`）。
- 将默认扫描策略（`DEFAULT_SCAN_POLICY`）集成到配置中。

## 重要不变性
- 返回的 `SpineConfig` 必须始终包含 `CURRENT_CONFIG_SCHEMA_VERSION`。
- 返回的 `SpineConfig` 必须始终包含 `DEFAULT_SCAN_POLICY`。
- 项目名称默认为 `'unnamed-project'`，语言环境默认为 `['en-US']`。

## 不涉及的范围（该模块不做什么）
- **不**执行配置验证或架构强制检查。
- **不**从外部源（如文件、环境变量）加载配置。
- **不**允许在创建后对配置进行运行时修改。

## 最重要的导出行为
唯一的公开接口是 `createDefaultConfig()` 函数，它返回一个包含所有默认值的完整 `SpineConfig` 对象。