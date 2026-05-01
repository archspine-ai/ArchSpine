<!-- spine-content-hash:6bc3ff90c686321640781a3e78d9597c8f271c0fb261f2560071b24340c589e9 -->
# `parsePromptPolicyTier` — 基础设施工具函数

## 角色
一个纯函数、确定性的工具函数，用于从原始字符串输入中解析和验证 `PromptPolicyTier` 配置值。

## 主要职责
- 接受原始字符串（或 `undefined`），返回经过验证的 `PromptPolicyTier` 枚举值（`'lite'` 或 `'balanced'`）。
- 通过修剪空白字符并转换为小写，对输入进行规范化处理，确保类型安全的匹配。
- 对于空值、`undefined` 或无法识别的输入，返回 `undefined`，从而提供清晰的可选结果。

## 重要不变性与负面范围
- **纯函数且确定**：相同输入始终产生相同输出，无副作用。
- **永不抛出异常**：无效输入始终返回 `undefined`，不抛出异常。
- **输入类型严格限定为 `string | undefined`**：不处理其他类型。
- **不在范围内**：不解析其他配置值，不与文件系统、网络或外部服务交互，不执行任何日志记录或错误报告。

## 公开接口
- `parsePromptPolicyTier(value: string | undefined): PromptPolicyTier | undefined`