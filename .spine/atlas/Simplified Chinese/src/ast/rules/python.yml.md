# ArchSpine Python代码分析模式语言

## 为什么需要本文档
本文档定义了一套基于模式的语言，用于ArchSpine镜像系统对Python源代码进行静态分析。它通过具体的模式与占位符，明确了如何识别代码中的导入、导出以及使用（函数调用与属性访问）操作。目的是让系统能够自动提取并映射代码实体，从而在镜像之间复制代码结构。

## 谁应该阅读
维护或扩展ArchSpine镜像系统的开发者与AI代理。任何希望理解或贡献Python导入/导出/使用关系静态分析规则的人员都应参考本文档。

## 锚定的关键决策与工作流程
- 模式语言仅限于Python语法。非Python语言、运行时行为以及文档注释明确不在考虑范围之内。
- 占位符（如`$NAME`、`$$$SYMBOLS`、`$$$ARGS`、`$VAL`、`$OBJ`）允许灵活匹配实际代码。
- 三类模式：导入（from_import、simple_import）、导出（function、class、async_function、variable、`__all__`）和使用（call、property）。
- 这些模式驱动ArchSpine代码分析管道的解析引擎，影响依赖追踪与结构镜像的决策。

## 模式概览
- **导入模式**：`from $SOURCE import $$$SYMBOLS` 和 `import $$$SYMBOLS` 捕获显式与通配导入。
- **导出模式**：涵盖顶层定义——函数（含异步函数）、类、变量以及 `__all__` 列表。
- **使用模式**：通过 `$NAME($$$ARGS)` 与 `$OBJ.$NAME` 识别函数调用和属性/成员访问。

本文档是ArchSpine解释Python代码边界的唯一权威来源。