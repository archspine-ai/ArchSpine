<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/infra/prompt-context","role":"This directory contains the core orchestration and configuration modules for the ArchSpine prompt policy system.","responsibility":"Collectively, these components manage the lifecycle of prompt generation, including policy resolution, budget calculation, content trimming, diagnostic generation, and type-safe configuration parsing, ensuring consistent and efficient prompt assembly for the LLM orchestration system.","children":[{"filePath":"src/infra/prompt-context/artifacts.ts","role":"Core orchestration service that assembles source prompt artifacts by coordinating policy resolution, budget calculation, content trimming, and diagnostic generation.","fileKind":"source"},{"filePath":"src/infra/prompt-context/budgets.ts","role":"Infrastructure utility function for calculating prompt token budgets based on task mode, validation policy, and source code artifacts.","fileKind":"source"},{"filePath":"src/infra/prompt-context/constants.ts","role":"Centralized configuration module defining typed constants and budget profiles for the ArchSpine prompt policy system.","fileKind":"source"},{"filePath":"src/infra/prompt-context/diagnostics.ts","role":"Core diagnostic utility for analyzing rule block retention and filtering in prompt relevance processing.","fileKind":"source"},{"filePath":"src/infra/prompt-context/parsers.ts","role":"Infrastructure utility function for parsing and validating the PromptPolicyTier configuration value from raw string input.","fileKind":"source"},{"filePath":"src/infra/prompt-context/policy.ts","role":"Infrastructure policy resolver providing default prompt and validation policies based on task mode.","fileKind":"source"},{"filePath":"src/infra/prompt-context/trim.ts","role":"Core utility module providing text trimming and formatting functions for the ArchSpine system.","fileKind":"source"},{"filePath":"src/infra/prompt-context/types.ts","role":"Central TypeScript type definition module for prompt generation, validation, diagnostic configuration, and generation strategy within the ArchSpine LLM orchestration system.","fileKind":"source"}],"provenance":{"indexedAt":"2026-05-01T03:58:47.637Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 提示上下文目录

`src/infra/prompt-context` 目录是 ArchSpine 提示策略系统的核心编排枢纽。它管理提示生成的完整生命周期，包括策略解析、预算计算、内容修剪和诊断分析。

## 关键组件

- **`artifacts.ts`** – 核心编排服务，通过协调策略解析、预算计算、内容修剪和诊断生成来组装源提示工件。
- **`budgets.ts`** – 根据任务模式、验证策略和源代码工件计算提示令牌预算。
- **`constants.ts`** – 为整个提示策略系统定义类型化常量和预算配置文件。
- **`diagnostics.ts`** – 在提示相关性处理过程中分析规则块保留和过滤情况。
- **`parsers.ts`** – 从原始字符串输入解析并验证 `PromptPolicyTier` 配置值。
- **`policy.ts`** – 根据当前任务模式解析默认提示和验证策略。
- **`trim.ts`** – 提供用于提示组装的文本修剪和格式化工具。
- **`types.ts`** – 提示生成、验证、诊断配置和生成策略的集中式 TypeScript 类型定义。

## 实现重点

最关键的区域是编排服务（`artifacts.ts`），它连接所有其他模块，以及类型定义（`types.ts`），确保整个系统的类型安全配置。预算计算（`budgets.ts`）和策略解析（`policy.ts`）模块对于维护一致且高效的提示组装也至关重要。