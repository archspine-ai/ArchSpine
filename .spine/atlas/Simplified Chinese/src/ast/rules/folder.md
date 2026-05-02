<!-- spine-content-hash:folder:{"schemaVersion":"1.0.0","directory":"src/ast/rules","role":"Language-specific grammar definitions for parsing source code into structured symbols.","responsibility":"Provides pattern-based extraction rules for imports, exports, and usages across multiple programming languages (C, C++, Go, Java, Python, Rust, TypeScript/JavaScript), enabling the ArchSpine mirror system to analyze and index code structures uniformly.","children":[{"filePath":"src/ast/rules/c.yml","role":"Defines the structural grammar and pattern-matching rules for parsing C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/cpp.yml","role":"Defines the syntax and rules for extracting structural metadata from C/C++ source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/go.yml","role":"Define the syntax patterns for parsing Go source code into a structured symbol index","fileKind":"document"},{"filePath":"src/ast/rules/java.yml","role":"Defines the syntax patterns for parsing Java-like source code within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/python.yml","role":"Defines the pattern-based extraction rules for parsing Python source code symbols (imports, exports, and usages) within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/rust.yml","role":"Defines the syntax and pattern-matching rules for extracting code structures from Rust source files within the ArchSpine mirror system.","fileKind":"document"},{"filePath":"src/ast/rules/typescript.yml","role":"Defines the pattern-based extraction rules for parsing TypeScript/JavaScript source code into structured symbols (imports, exports, usages).","fileKind":"document"}],"provenance":{"indexedAt":"2026-05-01T03:58:48.079Z","generatorVersion":"archspine/1.0.0","pipelineStages":["ast","llm"]}} -->
# src/ast/rules — 语言语法规则定义

本目录存放ArchSpine镜像系统中各语言的语法与模式匹配规则。其核心作用是定义如何从多种编程语言的源代码中提取导入、导出和使用引用，从而构建统一的符号索引。

目录按语言组织，每种语言对应一个YAML文件：

- **c.yml** — C语言的解析规则。
- **cpp.yml** — C++语言的解析规则（同时包含C语言相关结构）。
- **go.yml** — Go语言的导入/导出与符号提取模式。
- **java.yml** — Java及类Java语言（如Kotlin）的规则。
- **python.yml** — Python导入、导出和使用的提取逻辑。
- **rust.yml** — 覆盖Rust模块、trait和use语句的规则。
- **typescript.yml** — TypeScript/JavaScript的导入、导出和使用模式。

最重要的实现领域是抽象语法树（AST）层：每个规则文件定义了语法结构，解析器据此遍历源文件，生成语言无关的符号表示。其中 `go.yml` 和 `rust.yml` 尤为关键，因为它们的模块系统与C语言家族差异较大。

对于AI代理，这些规则是生成代码分析查询和检索跨语言符号依赖的核心知识库。开发人员在优化解析精度或添加新语言支持时，应从此目录入手。