<!-- spine-content-hash:5618ec2cd7d4aadcaf616c3f7873b797f31dcc4a9c4525bb6797a7a8d669aecb -->
# ArchSpine 配置管理器

## 角色
基础设施配置管理器，为 ArchSpine 项目的运行时设置提供集中访问和变更能力。

## 主要职责
- 通过配置加载器从文件系统加载并验证配置数据。
- 通过委托给核心扫描策略解析器来解析扫描策略。
- 管理 LLM 配置值，包括设置、清除和持久化变更。
- 处理工件和初始化状态配置部分。
- 解析布尔环境变量以进行配置解析。
- 通过专用解析器解析预提交钩子设置。

## 重要不变性
- 配置数据必须在任何访问之前加载并验证。
- 扫描策略必须通过核心扫描策略解析器进行解析。
- LLM 配置变更必须持久化到文件系统。
- 所有配置访问必须通过公共外观方法进行。

## 负面范围（不在范围内）
- 直接的文件系统 I/O 操作（委托给 FileSystemManager）。
- 核心扫描策略逻辑（委托给 core/scan-policy）。
- 低级环境变量解析（委托给 env.ts）。
- 预提交钩子实现细节（委托给 precommit.ts）。

## 最重要的导出/公共接口
- `loadConfigData` – 从文件系统加载并验证配置。
- `resolveScanPolicy` – 通过核心解析器解析扫描策略。
- `parseBooleanEnv` – 解析布尔环境变量。
- `resolvePreCommitSetting` – 解析预提交钩子设置。
- `SpineConfig` – 配置数据类型。
- `BooleanSettingResolution` – 布尔设置解析类型。
- `HookSyncMode` – 钩子同步模式类型。
- `ArtifactStrategy` – 工件策略类型。
- `SupportedConfigKey` – 支持的配置键类型。
- `PromptPolicyTier` – 提示策略层级类型。
- `LLMMode` – LLM 模式类型。
- `ValidatePolicy` – 验证策略类型。

## 架构意图
提供一个稳定的基础设施外观用于配置管理，将运行时设置与核心编排逻辑隔离。

## 近期变更意图
解决 lint 错误并在 v1.0 之前完成流水线修复，确保配置管理器符合项目标准。