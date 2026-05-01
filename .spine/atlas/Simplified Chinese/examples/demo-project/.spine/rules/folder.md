<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"examples/demo-project/.spine/rules","role":"Architectural governance specification for the ArchSpine project.","responsibility":"Defines and enforces layer isolation rules, documentation requirements, and automated compliance checks across API, domain, and infrastructure modules.","children":[{"filePath":"examples/demo-project/.spine/rules/arch.yml","role":"Defines architectural rules and constraints for the ArchSpine demo project, serving as a machine-readable governance specification.","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T02:46:57.106Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# ArchSpine 规则目录

此目录（`examples/demo-project/.spine/rules`）包含 ArchSpine 演示项目的架构治理规范。它定义并强制执行跨 API、领域和基础设施模块的层隔离规则、文档要求和自动化合规检查。

## 主要子项

- **`arch.yml`** – 一个机器可读的治理规范，定义了演示项目的架构规则和约束。

## 实现领域

规则目录专注于：
- **层隔离** – 强制 API、领域和基础设施层之间的边界。
- **文档要求** – 确保架构决策被记录。
- **自动化合规检查** – 验证项目是否符合定义的规则。

## 具体子模块

- **`arch.yml`** – 管理整个演示项目架构的主要规则文件。