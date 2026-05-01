<!-- spine-content-hash:7ffff5b4bbfe3cc4b33e38a05eca773b705937134527121258ebde848d9db7e4 -->
# ArchSpine 视图定义模块

## 角色
ArchSpine 系统中架构可视化视图的中央注册表和类型定义模块。

## 主要职责
- 定义 `ViewDefinition` TypeScript 接口，为每个架构视图指定元数据（ID、标题、描述、启用状态、需求、输出）。
- 维护 `VIEW_DEFINITIONS` 常量数组，作为所有支持的可视化输出的权威数据源。
- 提供派生数据结构（`VIEW_DEFINITION_MAP`），支持通过视图 ID 进行高效的 O(1) 查找。
- 导出用于筛选和检索视图定义的实用函数（例如，按 `defaultEnabled` 状态筛选）。

## 重要不变性
- `VIEW_DEFINITIONS` 是视图元数据的唯一权威来源。
- `ViewDefinition` 接口保持稳定并导出，确保整个系统的类型安全。

## 不涉及范围
- 渲染或生成可视化内容。
- 编排运行时服务。
- 处理用户身份验证或授权。
- 持久化视图状态或配置。

## 最重要的导出行为
- **`ViewDefinition` 接口**：所有视图定义必须遵循的核心类型。
- **`VIEW_DEFINITIONS` 常量数组**：所有支持视图的权威列表。
- **`VIEW_DEFINITION_MAP`**：用于按视图 ID 快速访问的查找映射。
- **实用函数**：例如 `getDefaultEnabledViews`，用于根据视图的默认启用状态进行筛选。