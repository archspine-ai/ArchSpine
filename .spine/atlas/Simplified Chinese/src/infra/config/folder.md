## 配置管理层（`config/`）

该目录实现了 **ArchSpine 系统的配置管理层**，负责配置设置的全生命周期管理：默认值定义、磁盘加载、环境变量解析、模式验证、运行时读写访问以及用户覆盖配置的持久化。该层设计为类型安全的中心网关，为系统其余部分提供已完全解析的 `SpineConfig` 对象。

### 主要子模块及分组

- **核心类型与默认配置**  
  `types.ts` – 集中定义配置接口（`SpineConfig`、`BooleanSettingResolution`、`HookSyncMode`、`ArtifactStrategy`、`SupportedConfigKey`）。  
  `defaults.ts` – 使用当前配置模式版本、默认扫描策略以及 LLM 和 MCP 的空存根，构建并返回默认 `SpineConfig` 对象的工厂模块。

- **环境变量与预提交处理**  
  `env.ts` – 提供环境变量解析工具（如 `parseBooleanEnv`、`parsePositiveIntegerEnv`），并定义标准的环境变量名 `PRE_COMMIT_ENV_VAR`。  
  `precommit.ts` – 从环境变量解析预提交钩子的设置，若未设置则回退到显式参数；返回类型化的 `BooleanSettingResolution` 对象。

- **加载与验证**  
  `loader.ts` – 从 JSON 文件读取配置，解析、校验结构，并通过浅到中等深度的合并（数组整体替换）与默认值合并。解析错误时输出人类可读的警告。  
  `validation.ts` – 验证外观模块，将未知负载与核心配置模式进行校验，成功时返回类型化的 `SpineConfig`，失败时返回 `null` 并附带结构化警告信息。

- **运行时访问与修改**  
  `facade.ts` – 集中的配置存储，提供读写访问。加载/写入持久化配置数据，解析扫描策略，管理 LLM 设置，并处理工件策略和初始化状态。实现 `ConfigSupportedValueAccess` 接口。  
  `supported-values.ts` – 定义类型安全接口及其实现（`getSupportedValue`、`setSupportedValue`），用于访问和修改所有用户可配置的参数（LLM 设置、验证策略、钩子模式等）。

### 关键实现领域

- **模式驱动验证** – 配置负载需通过核心配置模式解析器的校验，确保结构完整性在运行时使用前得到保证。
- **环境变量集成** – 布尔值和正整数设置可通过环境变量覆盖，具备安全解析和回退逻辑。
- **分层默认值与覆盖** – 采用合并策略，将内置默认值与用户提供的覆盖配置合并，在数组层级停止，防止意外深层合并。
- **运行时配置存储** – `facade.ts` 作为其他模块读写配置值的单一入口，并支持持久化到磁盘。
- **预提交钩子治理** – 可通过环境变量强制设定预提交设置，使运维团队无需修改配置文件即可控制行为。