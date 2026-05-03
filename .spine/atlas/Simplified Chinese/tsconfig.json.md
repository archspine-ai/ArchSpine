# ArchSpine TypeScript 配置摘要

本配置定义了 **ArchSpine** 项目如何将 TypeScript 源代码编译为适用于 Node.js 执行的 JavaScript。它强制实施严格类型安全与现代 Node.js ESM 兼容性。

## 配置控制的参数

通过 `tsconfig.json` 设置，关键参数如下：

- **`target`**：`"ESNext"` – 使用最新的 ECMAScript 特性。需要 Node.js >= 22。
- **`module`**：`"NodeNext"` – 启用 Node.js 原生 ESM，支持 `.mjs`/`.cjs` 扩展名。
- **`moduleResolution`**：`"NodeNext"` – 遵循 Node.js ESM 解析算法。
- **`outDir`**：`"./dist"` – 编译后 JavaScript 文件的输出目录。
- **`rootDir`**：`"./src"` – TypeScript 源文件的根目录。
- **`strict`**：`true` – 启用完整严格类型检查。提升代码安全性，但初期可能导致大量类型错误。
- **`esModuleInterop`**：`true` – 允许从 CommonJS 模块进行默认导入，平滑 ESM 与 CJS 的互操作。
- **`skipLibCheck`**：`true` – 跳过对 `.d.ts` 文件的类型检查。加快编译速度，但可能隐藏第三方库的类型错误。
- **`forceConsistentCasingInFileNames`**：`true` – 强制所有文件使用一致的命名大小写，防止不区分大小写的系统上的问题。
- **`types`**：`["node"]` – 包含 Node.js 内置类型定义（如 process、fs 等）。
- **`sourceMap`**：`true` – 生成源码映射文件便于调试。增加输出体积但有助于开发。
- **`include`**：`["src/**/*"]` – 仅编译 `src/` 目录下的文件。

## 稳定性与风险

该配置强制**严格类型安全**和**现代 Node.js ESM 兼容性**，增强了代码可靠性，但如果代码库未完全类型化或使用旧模式，可能导致构建失败。`skipLibCheck` 选项减少了编译时间，但可能掩盖第三方库的类型问题。`"ESNext"` 目标可能不被旧版 Node.js 运行时支持，从而引起运行时错误。总体而言，此设置适用于**最新 Node.js（>=22）的新开发**，但从旧配置迁移时可能需要调整。

运维人员应：

- 确保 Node.js 运行时版本为 v22 或更高。
- 在部署前解决所有 TypeScript 严格错误。
- 如果第三方库更新，定期检查被跳过的类型检查项。