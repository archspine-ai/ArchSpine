<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/ast","role":"AST parsing and language discovery layer for the ArchSpine mirror system.","responsibility":"Provides a unified pipeline for parsing source code into structured symbols and imports using language-specific AST rules, managing language registrations, and discovering language composition across file collections.","children":[{"filePath":"src/ast/extractor.ts","role":"AST parsing service that extracts structural symbols and imports from source code using language-specific rule sets loaded from YAML configuration files.","fileKind":"source"},{"filePath":"src/ast/lang-discovery.ts","role":"AST language discovery and lifecycle module that scans file collections, resolves programming languages via extension mapping, computes deltas between snapshots, and validates language support.","fileKind":"source"},{"filePath":"src/ast/lang-registry.ts","role":"Stateful language configuration registry and dynamic language loader for the ArchSpine code analysis pipeline, managing AST-grep language bindings and file-to-language resolution.","fileKind":"source"},{"filePath":"src/ast/rules","role":"Language-specific grammar definitions for parsing source code into structured symbols.","fileKind":"folder"}],"provenance":{"indexedAt":"2026-05-01T04:57:47.579Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/ast` — 抽象语法树解析与语言发现层

该目录是 ArchSpine 镜像系统的**解析与语言发现核心**。它提供了一条统一的流水线，能够将原始源代码转换为结构化的符号和导入关系，并利用语言特定的 AST 规则完成这一过程。

## 关键组件

- **`extractor.ts`** — 核心的 AST 解析服务。它从 YAML 配置文件中加载语言特定的规则集，并从源代码中提取结构符号（类、函数、变量）以及导入语句。

- **`lang-discovery.ts`** — 语言发现与生命周期模块。它扫描文件集合，通过文件扩展名映射解析编程语言，计算快照之间的差异，并验证所有检测到的语言是否受支持。

- **`lang-registry.ts`** — 一个有状态的注册表，负责管理语言配置并动态加载 AST-grep 语言绑定。它处理文件到语言的解析，确保分析流水线能够访问正确的语法定义。

- **`rules/`** — 一个文件夹，包含语言特定的语法定义（YAML 文件），这些文件定义了每种编程语言的源代码如何被解析为结构化符号。

## 关键实现领域

最重要的实现领域包括：
1. **语言规则加载** — 如何发现、验证 YAML 语法定义并在提取过程中应用它们。
2. **快照差异计算** — `lang-discovery.ts` 如何追踪文件集合快照之间的变化。
3. **动态语言绑定** — `lang-registry.ts` 如何为每种支持的语言解析并缓存 AST-grep 绑定。