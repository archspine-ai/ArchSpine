`config/` 目录是 ArchSpine 镜像系统的集中配置管理模块，涵盖了配置的完整生命周期：默认值、从磁盘加载、验证、环境变量解析、运行时读写访问以及受支持值的枚举。

**关键子模块及其职责：**

- `defaults.ts` – 构建一个完整填充的默认 `SpineConfig` 对象（包含模式版本、扫描策略、项目元数据、空的 LLM/MCP 存根）。
- `env.ts` – 提供环境变量解析工具（`parseBooleanEnv`、`parsePositiveIntegerEnv`）以及规范的环境变量名 `SPINE_PRECOMMIT`。
- `precommit.ts` – 从环境变量解析预提交钩子启用设置，并支持显式回退。
- `loader.ts` – 从文件路径读取配置，与默认值合并，并通过 `validation.ts` 进行验证。
- `validation.ts` – 针对核心配置模式验证未知负载，返回类型化的 `SpineConfig` 或 null，并附带结构化的警告信息。
- `facade.ts` – 运行时配置存储；作为 `loader.ts` 和 `supported-values.ts` 的抽像门面，提供读写访问、扫描策略解析、LLM 配置管理以及持久化功能。
- `supported-values.ts` – 定义 `ConfigSupportedValueAccess` 接口，并提供所有用户可配置系统参数的 getter/setter 函数。
- `types.ts` – 集中的类型定义：重新导出 `SpineConfig`，定义 `BooleanSettingResolution`、`HookSyncMode`、`ArtifactStrategy` 以及 `SupportedConfigKey` 联合类型。

**最重要的实现领域：** 环境变量治理（env、precommit）、配置加载与合并（loader、validation）以及运行时门面（facade）——它协调所有操作并持久化更改。