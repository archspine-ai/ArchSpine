<!-- spine-content-hash:be70097ede9d3a94955696ccc1211eaf63ba4db7cc7fd12458933a79ffb02541 -->
# 输出合约渲染器

## 角色
为 ArchSpine 提示响应系统生成格式化输出合约字符串的实用函数。

## 主要职责
- 根据指定的 `PromptResponseMode` 和目标语言列表，渲染 OUTPUT CONTRACT 部分的文本。
- 当响应模式不是 `'json-only'` 时，有条件地包含 Markdown 块指令。
- 验证语言列表，确保 `'English'` 作为必需的基础语言被包含在内。

## 重要不变性与负面范围
- 函数必须始终返回以 `'OUTPUT CONTRACT:'` 开头的字符串。
- 函数必须始终包含前两个编号的合约点。
- 当 `responseMode` 为 `'json-only'` 时，函数必须仅返回 JSON 合约，不包含 Markdown 指令。
- 函数必须验证语言数组中是否包含 `'English'`（不区分大小写）。
- **不**处理实际的 JSON 模式生成或验证。
- **不**管理超出输出合约部分的提示构建。
- **不**与文件 I/O、网络或外部服务交互。

## 最重要的导出行为
- **`renderOutputContract(responseMode: PromptResponseMode, languages: string[]): string`** — 唯一的公共函数，用于生成格式化的输出合约字符串。