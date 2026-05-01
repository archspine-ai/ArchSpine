<!-- spine-content-hash:dab4ff9d929aa40e91305f7a0b3f6e649e0bec095309ecba61d1a37460194f82 -->
# ArchSpine 构建脚本

## 目的
本文档定义了 ArchSpine 项目的构建流程。它确保 TypeScript 源代码被编译、规则文件和静态资源被复制到分发目录，并且模拟目录（`__mocks__`）不会出现在最终输出中。

## 上下文与受众
面向维护 ArchSpine 构建流程的开发者。文档说明了分发产物是如何生成的，以及为了保持输出整洁和可执行所采取的步骤。

## 主要职责
- 使用 `tsc` 将 TypeScript 源代码编译为 JavaScript
- 将 AST 规则文件从 `src` 复制到 `dist`
- 将静态资源从 `src/assets` 复制到 `dist/assets`
- 从 `dist` 输出中移除 `__mocks__` 目录
- 为 CLI 入口文件设置可执行权限

## 不涉及范围
- 单元测试或集成测试逻辑
- 镜像系统的运行时行为
- ArchSpine 的配置或模式定义

## 关键要点
- 构建流程先运行 `tsc`，然后将规则文件和资源复制到 `dist/` 目录
- 模拟目录（`__mocks__`）会从分发树中显式移除
- CLI 入口文件在编译后被设置为可执行权限