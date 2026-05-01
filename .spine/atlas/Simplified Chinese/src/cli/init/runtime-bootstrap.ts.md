<!-- spine-content-hash:b343483e3962c839f9c7d1914ea6c4fba72559f6081eed058e2375c18ffd53ea -->
# ArchSpine CLI 运行时引导

## 角色
CLI 运行时引导编排器，用于初始化 ArchSpine 系统并触发构建流水线。

## 主要职责
- 通过运行时服务提示协调 LLM 凭据设置和范围确认。
- 触发初始文件系统扫描，使用 Scanner 引擎发现跟踪的文件。
- 调用语言发现功能，检测代码库中的编程语言。
- 使用发现的语言快照更新系统清单。
- 调用构建工作流命令，处理扫描和发现的数据。

## 不涉及范围
- 直接的文件系统 I/O 或持久化操作（委托给 Scanner 和 Manifest）。
- 语言检测算法（委托给 `discoverLanguages`）。
- 构建流水线执行细节（委托给 `runBuildWorkflow`）。

## 不变约束
- CLI 入口点不得吸收本应属于 services、core、engines 或 infra 的流水线或持久化逻辑。

## 公开接口
- `runRuntimeBootstrap(options: RuntimeBootstrapOptions): Promise<void>`

## 值得注意的规则违反
- **cli-entrypoint-separation（错误）：** `runRuntimeBootstrap` 函数直接编排流水线步骤（扫描、语言发现、清单更新、构建工作流），吸收了本应位于 services、core、engines 或 infra 中的逻辑。这违反了 CLI 模块必须保持为入口点和命令适配器的规则。

## 变更意图
- **架构意图：** 提供一个轻量的 CLI 引导入口点，用于初始化系统并委托给引擎和服务。
- **近期变更意图：** 在 v1.0 之前解决 lint 错误并完成流水线修复，可能涉及对引导流程的调整。