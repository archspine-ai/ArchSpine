<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/ast/rules","role":"Language-specific grammar definitions for parsing source code into structured symbols.","responsibility":"Provides pattern-based extraction rules for imports, exports, and usages across multiple programming languages (C, C++, Go, Java, Python, Rust, TypeScript/JavaScript), enabling the ArchSpine mirror system to analyze and index code structures uniformly.","children":[{"filePath":"src/ast/rules/c.yml","role":"Defines the structural grammar and pattern-matching rules for parsing C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/cpp.yml","role":"Defines the syntax and rules for extracting structural metadata from C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/go.yml","role":"Define the syntax patterns for parsing Go source code into a structured symbol index","fileKind":"document"},{"filePath":"src/ast/rules/java.yml","role":"Defines the syntax patterns for parsing Java-like source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/python.yml","role":"Defines the pattern-based extraction rules for parsing Python source code symbols (imports, exports, and usages) within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/rust.yml","role":"Defines the syntax and pattern-matching rules for extracting code structures from Rust source files within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/typescript.yml","role":"Defines the pattern-based extraction rules for parsing TypeScript/JavaScript source code into structured symbols (imports, exports, usages).","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.079Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
## `src/ast/rules` — 各语言语法定义

该目录是 ArchSpine 镜像系统的**语法定义中心**。它包含一组 YAML 文件，每个文件对应一种编程语言，定义了从源代码中提取 **导入（imports）**、**导出（exports）** 和 **使用（usages）** 的模式化规则。

### 主要子文件

目录中包含以下语言规则文件：

- **`c.yml`** — C 语言结构的解析规则。
- **`cpp.yml`** — C++ 语法与结构元数据规则。
- **`go.yml`** — 提取 Go 符号索引的模式。
- **`java.yml`** — Java 类语言的语法定义。
- **`python.yml`** — Python 的导入、导出与使用规则。
- **`rust.yml`** — Rust 代码结构的语法定义。
- **`typescript.yml`** — TypeScript/JavaScript 符号提取规则。

### 实现重点

这些规则文件是 **ArchSpine 多语言支持的基础**。通过为每种受支持的语言提供统一的语法层，系统能够将异构代码库解析为一致的符号图。最关键的实现领域包括：

1.  **模式覆盖率** — 确保每种语言的导入/导出/使用模式完整且正确。
2.  **扩展性** — 支持新语言只需在此目录中添加一个新的 YAML 文件。
3.  **性能** — 高效匹配这些规则对于实时索引至关重要。