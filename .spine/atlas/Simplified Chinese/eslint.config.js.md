<!-- spine-content-hash:d2d92d23457c350db9a900156919306f2997f66e06ab666fafef6bdcf98e5367 -->
# ArchSpine ESLint 扁平配置

## 角色
该模块为 ArchSpine 项目提供 ESLint 扁平配置，用于定义 TypeScript 源文件的静态分析规则。

## 主要职责
- 为 `src/services/`、`src/tasks/`、`src/infra/`、`src/engines/` 和 `src/utils/` 目录中的 TypeScript 文件定义 lint 规则。
- 组合来自 `@eslint/js`、`typescript-eslint` 和 `eslint-config-prettier` 的推荐 ESLint 配置。
- 配置 linter 的 ECMAScript 版本和模块源类型。
- 强制执行编码标准，包括禁止未使用变量、优先使用 `const`、严格相等和强制使用花括号。

## 重要不变性与负面范围
- **不变性：** 配置必须始终通过 `tseslint.config()` 作为默认数组导出。
- **不变性：** `files` 模式必须仅针对 `src/` 子目录下的 TypeScript 文件。
- **负面范围：** 不配置测试文件或根级 TypeScript 文件的 lint 规则。
- **负面范围：** 不定义超出组合推荐配置的自定义规则。

## 公开接口
- **默认导出：** 由 `tseslint.config()` 生成的 ESLint 配置数组。

## 检测到的漂移
先前的语义契约将测试文件（`tests/` 目录）包含在 lint 范围内，但当前配置仅针对 `src/` 子目录。该文件不再适用于测试文件。