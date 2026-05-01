<!-- spine-content-hash:ba17f44b7a553811de7714023e42b5e74f04e0eda993a4cff8fa1c0265ddb957 -->
# ArchSpine – 视图层配置解析模块

本模块为 ArchSpine 系统中的实验性视图层和已启用的视图提供纯类型化的配置解析功能。它负责从项目配置、环境变量或默认值中读取、规范化并验证视图相关设置，不涉及任何运行时编排或 UI 交互。

## 角色

实验性视图层和已启用视图的配置解析模块。

## 主要职责

- 定义 TypeScript 接口 `ResolvedExperimentalViewLayer` 和 `ResolvedEnabledViews`，用于表示解析后的配置结构。
- 通过检查项目配置、环境变量或使用默认值来解析实验性视图层标志。
- 从项目配置或默认值中解析已启用的视图 ID 列表，对每个 ID 进行规范化并过滤掉未知条目。

## 重要不变性

- 本模块是**纯配置解析**，无任何副作用。
- 依赖 `infra/config` 获取项目配置，依赖 `view-registry` 进行视图 ID 规范化。
- **不**执行运行时编排、渲染或持久化操作。

## 非职责范围

- 视图服务或引擎的运行时编排。
- 与视图渲染或 UI 组件的直接交互。
- 配置数据的持久化或存储。

## 公开接口

- `ResolvedExperimentalViewLayer`
- `ResolvedEnabledViews`

这些是消费者用于访问已解析视图配置的主要导出接口。