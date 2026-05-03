---MARKDOWN:Simplified Chinese---
# ArchSpine 构建脚本摘要

## 目的
该脚本是 ArchSpine 项目的权威构建流水线。它协调编译、资产复制和清理步骤，以生成可直接运行的发布包。

## 背景与读者
面向需要从源码构建 ArchSpine 的开发者与维护者。使用者需熟悉 Node.js、TypeScript 及项目目录结构。

## 要点
- 运行 `tsc` 命令将 TypeScript 编译为 JavaScript。
- 将 AST 规则文件（YAML）及所有资产复制到 dist 目录。
- 复制过程中排除 `__mocks__` 目录，并在复制后将其从 dist 中删除，确保发布包洁净。
- CLI 入口文件被设置为可执行权限（0o755）。