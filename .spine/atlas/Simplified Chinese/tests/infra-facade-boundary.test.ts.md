<!-- spine-content-hash:7b5b9d28b8e8c2fa2ff4d18a33365eaf6b78aed82fe0b48401d6c207ebb28547 -->
# ArchSpine – 架构边界测试工具

本模块提供基于 Vitest 的测试基础设施，通过导入分析验证架构边界规则。它设计用于测试套件中，以在 TypeScript 代码库中强制实施层约束。

## 角色

用于通过导入分析验证架构边界规则的 Vitest 测试基础设施工具。

## 主要职责

- 递归收集目录中的 TypeScript 文件路径以进行架构分析
- 从 TypeScript 源文件中提取导入语句及其说明符
- 根据配置的边界规则验证导入路径，以强制实施架构层约束
- 在 Vitest 测试套件中提供架构完整性验证的测试断言

## 重要不变条件

- 所有测试文件必须以 `.test.ts` 或 `.spec.ts` 后缀结尾

## 排除范围

- 生产代码中架构规则的运行时强制执行
- 源文件的代码转换或重构
- 非 TypeScript 文件的静态分析

## 公开接口

- `collectFiles(dirPath, collected)` – 递归收集 TypeScript 文件路径
- `BoundaryRule` 接口 – 定义边界验证规则的结构
- 导入提取和验证逻辑 – 用于导入路径验证的核心分析函数