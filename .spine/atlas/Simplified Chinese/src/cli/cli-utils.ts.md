<!-- spine-content-hash:41a669693d805c0df730adf6a730009250e749ec5eaf05b9702c239630a6511b -->
# ArchSpine CLI 用户界面展示工具

## 角色
该模块是一个 CLI 用户界面展示工具，负责格式化语言发现结果、条件性渲染横幅以及解析配置值。

## 主要职责
- 将语言名称列表格式化为逗号分隔的字符串以供显示。
- 根据命令（help、init、build）决定是否显示完整 ArchSpine 横幅，或为 sync 命令显示迷你横幅。
- 将原始字符串配置值解析为类型化的 JavaScript 原始值（布尔值、数字、null、undefined、JSON 对象/数组）。
- 提供条件性横幅显示逻辑，以在内部钩子执行期间抑制输出。

## 重要不变性与负面范围
- CLI 模块必须保持为薄入口点和命令适配器，避免吸收管道或持久化逻辑。
- 该模块**不**处理管道或持久化逻辑（例如数据库访问、文件 I/O、构建编排）。
- 它**不**执行超出横幅显示决策的命令路由或参数解析。
- 核心错误处理或错误代码定义不在其范围内。

## 最重要的导出行为
- `formatLanguageList(languages: string[]): string` — 将语言名称数组转换为人类可读的逗号分隔字符串。
- `shouldShowFullBanner(cmd?: string, _argsArr?: string[]): boolean` — 如果应显示完整 ArchSpine 横幅（针对 help、init、build 命令），则返回 `true`。
- `shouldShowMiniBanner(cmd?: string): boolean` — 如果应显示迷你横幅（针对 sync 命令），则返回 `true`。
- `parseConfigValue(raw: string): unknown` — 将原始字符串解析为类型化的 JavaScript 原始值，支持布尔值、数字、null、undefined 以及 JSON 对象/数组。