<!-- spine-content-hash:0e5c4b2152da8ae2fbaf9c642a032447aab868c798faefa922bee1dfcb4af953 -->
# ArchSpine TypeScript 配置

## 角色
控制 ArchSpine 项目中 `src/` 目录下的 TypeScript 源文件如何编译为 `dist/` 目录中的 JavaScript 输出，包括模块格式、类型检查严格度和调试支持。

## 主要职责
- 将 TypeScript 源代码转译为 JavaScript
- 模块解析与打包策略
- 输出目录与源映射生成
- 类型检查严格度与库包含

## 不变约束
- 必须启用严格模式以强制类型安全
- 模块系统必须为 NodeNext 以支持 ESM/CJS 互操作
- 必须生成源映射以支持调试
- 输出目录必须为 `./dist`，源根目录必须为 `./src`

## 参数定义
- **target**：设置输出的 ECMAScript 目标版本；ESNext 使用 Node.js 支持的最新特性。
- **module**：定义模块代码生成方式；NodeNext 启用原生 ESM 并兼容 CommonJS 回退。
- **moduleResolution**：决定模块路径的解析方式；NodeNext 遵循 Node.js 的解析规则。
- **outDir**：指定编译后 JavaScript 文件的输出目录。
- **rootDir**：指定 TypeScript 源文件的根目录。
- **strict**：启用所有严格类型检查选项；对于在编译时捕获类型错误至关重要。
- **esModuleInterop**：允许从 CommonJS 模块进行默认导入；提高与 npm 包的兼容性。
- **skipLibCheck**：跳过对声明文件 (.d.ts) 的类型检查；加快编译速度但可能隐藏依赖中的类型错误。
- **forceConsistentCasingInFileNames**：确保导入时文件名大小写一致；防止跨平台问题。
- **types**：指定要包含的类型定义包；此处仅包含 @types/node。
- **sourceMap**：生成用于调试的源映射文件；将编译后的 JavaScript 映射回原始 TypeScript。

## 稳定性与风险
此配置直接影响构建可靠性和运行时行为。严格模式在编译时防止了许多常见的 JavaScript 错误。NodeNext 模块系统确保与现代 Node.js ESM 特性的兼容性，但如果依赖项不兼容 ESM 可能会导致问题。跳过库检查可加快构建速度，但可能使第三方库中的类型错误未被检测到。源映射对于调试至关重要，但会增加输出大小。总体而言，此配置优先考虑类型安全和现代模块支持，从而提高了长期可维护性并减少了运行时错误。

## 范围外
此配置未定义明确的范围外项目。