<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/config","role":"Configuration management layer for the ArchSpine mirror system.","responsibility":"Provides centralized configuration loading, validation, merging, and runtime access for all ArchSpine system settings, including LLM configuration, scan policies, pre-commit hooks, and artifact strategies.","children":[{"filePath":"src/infra/config/defaults.ts","role":"Configuration factory module providing a default SpineConfig object for the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/config/env.ts","role":"Infrastructure utility module providing environment variable parsing constants and functions.","fileKind":"source"},{"filePath":"src/infra/config/facade.ts","role":"Infrastructure configuration manager providing centralized access and mutation for the ArchSpine project's runtime settings.","fileKind":"source"},{"filePath":"src/infra/config/loader.ts","role":"Configuration loader and validator for the ArchSpine system, responsible for reading, parsing, validating, and merging configuration files with defaults.","fileKind":"source"},{"filePath":"src/infra/config/precommit.ts","role":"Configuration resolution utility for the pre-commit setting, determining its boolean value from environment variables or explicit parameters.","fileKind":"source"},{"filePath":"src/infra/config/supported-values.ts","role":"Core TypeScript interface defining the contract for accessing supported configuration values within the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/config/types.ts","role":"Type definition module centralizing configuration interfaces and enums for the ArchSpine mirror system.","fileKind":"source"},{"filePath":"src/infra/config/validation.ts","role":"Infrastructure validation facade for Spine configuration payloads.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T04:57:43.045Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/infra/config` — 配置管理层

此目录是 ArchSpine 镜像系统的集中配置管理层，负责加载、验证、合并所有系统设置，并在运行时提供访问接口。涵盖的配置包括 LLM 设置、扫描策略、预提交钩子以及工件策略。

## 主要子模块

- **`types.ts`** — 集中定义所有配置接口和枚举，明确 `SpineConfig` 对象及其子设置的形状。
- **`defaults.ts`** — 提供工厂函数，返回默认的 `SpineConfig` 对象，作为所有配置合并的基准。
- **`loader.ts`** — 读取、解析、验证配置文件，并与默认值合并，是配置摄入的主要入口。
- **`validation.ts`** — 验证外观模块，在配置生效前检查其正确性。
- **`facade.ts`** — 运行时配置管理器，对外暴露集中式的设置访问和修改方法。
- **`env.ts`** — 环境变量解析工具模块，将外部输入转换为内部配置常量。
- **`precommit.ts`** — 从环境变量或显式参数中解析预提交钩子的布尔值。
- **`supported-values.ts`** — 定义访问受支持配置值的契约，确保类型安全的查找。

## 关键实现领域

- **配置加载与验证** — `loader.ts` 和 `validation.ts` 构成配置摄入与验证的核心管道。
- **运行时访问与修改** — `facade.ts` 为其他系统组件提供运行时读写设置的主要 API。
- **环境集成** — `env.ts` 和 `precommit.ts` 处理环境变量等外部配置来源。
- **类型安全与默认值** — `types.ts` 和 `defaults.ts` 确保所有配置操作类型安全，并具备合理的回退值。