<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/cli/init","role":"This directory contains the initialization and bootstrapping subsystem for the ArchSpine project.","responsibility":"Collectively, these components handle the complete setup of an ArchSpine-managed repository, including configuration bootstrapping, runtime initialization, LLM credential setup, file scanning, language discovery, and git hook installation, all coordinated through shared type contracts.","children":[{"filePath":"src/cli/init/repository-bootstrap.ts","role":"CLI command adapter for bootstrapping an ArchSpine configuration and artifacts in a target repository.","fileKind":"source"},{"filePath":"src/cli/init/runtime-bootstrap.ts","role":"CLI runtime bootstrap orchestrator that initializes the ArchSpine system and triggers the build pipeline.","fileKind":"source"},{"filePath":"src/cli/init/types.ts","role":"TypeScript module defining shared type contracts for the ArchSpine initialization and repository bootstrapping subsystem.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.789Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 初始化目录概述

`src/cli/init` 目录承载 ArchSpine 项目的初始化与引导子系统。该目录下的组件共同管理一个由 ArchSpine 管理的仓库的完整设置，包括配置引导、运行时初始化、LLM 凭证设置、文件扫描、语言发现以及 Git 钩子安装，所有操作通过共享类型契约进行协调。

## 关键文件

- **repository-bootstrap.ts** – 一个 CLI 命令适配器，负责将 ArchSpine 配置和初始工件引导到目标仓库中，建立基础结构和必要文件。
- **runtime-bootstrap.ts** – 运行时引导编排器，初始化 ArchSpine 系统并触发构建流水线，处理启动操作的执行顺序。
- **types.ts** – 定义整个初始化和仓库引导子系统使用的共享 TypeScript 类型契约，确保各个引导组件之间的一致性。

## 重要实现领域

- 配置引导与工件生成
- 运行时初始化与构建流水线触发
- 跨组件通信的共享类型契约
- LLM 凭证、文件扫描、语言发现的集成点

该模块在编排逻辑（runtime-bootstrap）、仓库设置适配器（repository-bootstrap）以及将它们粘合在一起的类型定义之间实现了清晰的职责分离。