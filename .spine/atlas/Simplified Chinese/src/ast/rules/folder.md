<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/ast/rules","role":"Language-specific grammar definitions for parsing source code into structured symbols.","responsibility":"Provides pattern-based extraction rules for imports, exports, and usages across multiple programming languages (C, C++, Go, Java, Python, Rust, TypeScript/JavaScript), enabling the ArchSpine mirror system to analyze and index code structures uniformly.","children":[{"filePath":"src/ast/rules/c.yml","role":"Defines the structural grammar and pattern-matching rules for parsing C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/cpp.yml","role":"Defines the syntax and rules for extracting structural metadata from C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/go.yml","role":"Define the syntax patterns for parsing Go source code into a structured symbol index","fileKind":"document"},{"filePath":"src/ast/rules/java.yml","role":"Defines the syntax patterns for parsing Java-like source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/python.yml","role":"Defines the pattern-based extraction rules for parsing Python source code symbols (imports, exports, and usages) within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/rust.yml","role":"Defines the syntax and pattern-matching rules for extracting code structures from Rust source files within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/typescript.yml","role":"Defines the pattern-based extraction rules for parsing TypeScript/JavaScript source code into structured symbols (imports, exports, usages).","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.079Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# `src/ast/rules` — 语言语法定义

此目录包含驱动 ArchSpine 基于 AST 的代码分析所需的语言特定语法和模式匹配规则。每个 YAML 文件定义了如何将特定编程语言的源代码解析为结构化符号（导入、导出和使用），从而使镜像系统能够跨语言统一地索引和分析代码。

## 主要子模块

该目录按语言组织，每种支持的语言对应一个 YAML 文件：

- **`c.yml`** — 用于解析 C/C++ 源代码的结构化语法。
- **`cpp.yml`** — 从 C/C++ 源代码中提取结构化元数据的语法规则。
- **`go.yml`** — 将 Go 代码解析为结构化符号索引的语法模式。
- **`java.yml`** — 解析类 Java 源代码的模式。
- **`python.yml`** — 提取 Python 符号（导入、导出、使用）的规则。
- **`rust.yml`** — 用于 Rust 代码结构的语法和模式匹配。
- **`typescript.yml`** — 用于 TypeScript/JavaScript 导入、导出和使用的模式。

## 关键实现领域

最重要的实现领域包括：

- **跨语言统一性** — 确保所有语言语法生成一致的符号模型（导入、导出、使用），使镜像系统能够以相同方式处理任何语言的代码。
- **模式准确性** — 每个 YAML 文件必须正确捕获其语言的惯用结构（例如 Rust 中的 `use` 语句、Python 中的 `import`、JavaScript 中的 `require`）。
- **可扩展性** — 规则系统设计为可通过添加遵循既定模式的新 YAML 文件轻松扩展以支持新语言。