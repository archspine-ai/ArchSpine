<!-- spine-content-hash:fcf284698e43bd8557ea0f75e6df128be134bb54b3465c015032e7b158acf454 -->
# ArchSpine DTO 接口模块

本 TypeScript 模块定义了 ArchSpine 同步与清单系统中使用的核心数据传输对象（DTO）接口，为子系统间的数据流转提供集中、类型安全的契约。

## 职责

核心 TypeScript 模块，定义 ArchSpine 同步与清单系统共享的 DTO 接口。

## 主要职责

- **SyncBlock** – 表示同步操作的状态。
- **DocRef** – 表示对本地化文档文件的引用。
- **FileStatus** – 表示系统中文件的状态。
- **SpineManifest** – 表示 ArchSpine 项目的根清单结构。

## 关键不变性

- 所有导出的符号均为 TypeScript 接口（无类或运行时值）。
- 接口仅定义数据结构，不包含方法。
- 依赖从 `./index-documents.js` 和 `./versions.js` 导入的类型。

## 排除范围（非职责）

- **不**实现同步逻辑。
- **不**验证或转换 DTO 数据。
- **不**提供这些接口的运行时实例化。

## 导出的公开接口

- `SyncBlock`
- `DocRef`
- `FileStatus`
- `SpineManifest`

## 规则违规

以下接口未遵循内部接口所需的 `I` 前缀命名约定：`SyncBlock`、`DocRef`、`FileStatus`、`SpineManifest`。（严重性：警告）

## 漂移检测

未检测到漂移。