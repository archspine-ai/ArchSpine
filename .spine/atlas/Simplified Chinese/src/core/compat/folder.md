<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/core/compat","role":"This directory contains the core L2 aggregation logic for the ArchSpine mirror system.","responsibility":"It orchestrates data collection from multiple L1 sources, performs validation and deduplication, and constructs the canonical L2 state for the mirror network.","children":[],"provenance":{"indexedAt":"2026-04-18T15:36:29.340Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine – `src/core/compat` 目录摘要

该目录承载了 ArchSpine 镜像系统的核心 L2 聚合逻辑。其主要职责是协调来自多个 L1 源的数据收集，执行验证和去重，并为镜像网络构建规范的 L2 状态。

该目录目前不包含任何子模块或子目录，表明聚合逻辑直接在此级别的文件中实现。关键实现领域包括：

- **L1 数据摄取** – 从上游源收集原始数据
- **验证与去重** – 确保数据完整性并移除重复项
- **L2 状态构建** – 构建权威的镜像状态

随着项目的演进，该目录预计将增加针对每个聚合阶段的具体子模块。