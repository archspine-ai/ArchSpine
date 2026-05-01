<!-- spine-content-hash:29cf9dd98b74605a16434d839299491e1beeb495dd1db768c63a4a66cd715956 -->
# ASTExtractor

**角色：** AST解析服务，通过加载YAML配置文件中的语言特定规则集，从源代码中提取结构符号和导入信息。

## 主要职责

- 从规则目录加载并缓存语言特定的AST提取规则（YAML格式）。
- 使用LangRegistry为给定文件路径解析合适的语言语法。
- 使用ast-grep和解析后的语言语法解析源代码内容。
- 从AST中提取导出的符号（类、函数、变量、接口、类型）及其签名。
- 从AST中提取导入语句及其符号。
- 构建包含提取的符号、导入信息和结构元数据的FileSkeleton对象。

## 重要不变性

- 每种语言必须在规则目录中有对应的YAML规则文件。
- 在ASTExtractor能够解析语言之前，必须先初始化LangRegistry。
- AST提取规则必须符合预期的RuleSet模式。

## 排除范围（不负责）

- 不执行提取符号的语义分析或类型检查。
- 不处理非源代码文件（如二进制文件、图片）。
- 不管理提取骨架的生命周期或持久化。

## 公开接口

- `ASTExtractor` 类
- `ExtractedSymbol` 接口
- `ExtractedImport` 接口
- `FileSkeleton` 接口

## 架构意图

为ArchSpine镜像系统提供一个可复用的、语言无关的AST提取层，以实现对源代码的结构化分析。

## 近期变更

修复了lint警告和类型错误，并添加了用于代码质量保证的CI工作流。