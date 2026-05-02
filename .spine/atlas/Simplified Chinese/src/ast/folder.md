<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/ast","role":"AST parsing and language discovery layer for the ArchSpine mirror system.","responsibility":"Provides a unified pipeline for parsing source code into structured symbols and imports using language-specific AST rules, managing language registrations, and discovering language composition across file collections.","children":[{"filePath":"src/ast/extractor.ts","role":"AST parsing service that extracts structural symbols and imports from source code using language-specific rule sets loaded from YAML configuration files.","fileKind":"source"},{"filePath":"src/ast/lang-discovery.ts","role":"AST language discovery and lifecycle module that scans file collections, resolves programming languages via extension mapping, computes deltas between snapshots, and validates language support.","fileKind":"source"},{"filePath":"src/ast/lang-registry.ts","role":"Stateful language configuration registry and dynamic language loader for the ArchSpine code analysis pipeline, managing AST-grep language bindings and file-to-language resolution.","fileKind":"source"},{"filePath":"src/ast/rules","role":"Language-specific grammar definitions for parsing source code into structured symbols.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:57:47.579Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
`src/ast` 目录是 ArchSpine 镜像系统的 AST 解析与语言发现核心层。它提供了一条统一流水线，将源代码转换为结构化符号和导入声明，管理语言注册的整个生命周期，并发现文件集合中语言的组合方式。

该目录包含三个关键源码模块和一个子文件夹：

- **extractor.ts** – AST 解析服务，从源代码中提取结构符号和导入引用，依赖从 YAML 配置文件加载的语言特定规则集。

- **lang-discovery.ts** – 语言发现与生命周期模块，扫描文件集合、通过扩展名映射识别编程语言、计算快照差异，并验证语言是否受支持。

- **lang-registry.ts** – 有状态的语言配置注册表与动态加载器，管理 AST-grep 语言绑定和分析流水线之间的关系，并根据路径或内容解析文件的编程语言。

- **rules/** – 存放语言特定的语法定义，供 extractor 解析源码为结构化符号使用。

最重要的实现领域包括解析流水线（extractor）、基于快照的语言发现（lang-discovery）以及支持可插拔语言的动态注册表。