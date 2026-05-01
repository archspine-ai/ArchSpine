<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","responsibility":"Collectively, these components handle the complete setup of an ArchSpine-managed repository, including configuration bootstrapping, runtime initialization, LLM credential setup, file scanning, language discovery, and git hook installation, all coordinated through shared type contracts.","children":[{"filePath":"src/cli/init/repository-bootstrap.ts","role":"CLI command adapter for bootstrapping an ArchSpine configuration and artifacts in a target repository.","fileKind":"source"},{"filePath":"src/cli/init/runtime-bootstrap.ts","role":"CLI runtime bootstrap orchestrator that initializes the ArchSpine system and triggers the build pipeline.","fileKind":"source"},{"filePath":"src/cli/init/types.ts","role":"TypeScript module defining shared type contracts for the ArchSpine initialization and repository bootstrapping subsystem.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.789Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 初始化子系统 (`src/cli/init`)

此目录包含 ArchSpine 项目的**引导与初始化**子系统。它负责完成 ArchSpine 管理仓库的完整设置，从配置生成到运行时启动。

## 关键组件

- **`repository-bootstrap.ts`** – CLI 命令适配器，用于将 ArchSpine 配置和工件引导到目标仓库中。这是设置新项目的入口点。
- **`runtime-bootstrap.ts`** – 编排 ArchSpine 系统的运行时初始化，包括在设置完成后触发构建流水线。
- **`types.ts`** – 定义整个初始化和引导子系统共享的 TypeScript 类型契约，确保各组件之间的一致性。

## 实现领域

该子系统处理：
- 配置引导
- 运行时初始化
- LLM 凭据设置
- 文件扫描与语言发现
- Git 钩子安装

所有组件通过 `types.ts` 中定义的共享类型契约进行协调。