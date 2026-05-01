<!-- spine-content-hash:751c4ee4517dc3362146571e75a24c53df519c4159e04200f15d133379158676 -->
# ArchSpine – 策略常量与解析外观模块

## 角色
本模块作为**公共外观层**，提供提示策略常量、LLM 模式枚举及其解析/解析工具函数的稳定导入接口。它将策略定义与更广泛的提示上下文关注点解耦。

## 主要职责
- **导出常量**：包括 LLM 操作模式、提示策略层级、验证策略和预算配置。
- **导出解析函数**（`parseLLMMode`、`parsePromptPolicyTier`、`parseRelevanceDiagnosticsMode`、`parseValidatePolicy`）：将原始字符串转换为类型化枚举。
- **导出解析函数**（`resolvePromptPolicyTier`、`resolveValidatePolicy`）：根据给定上下文确定合适的策略。
- **导出辅助函数**（`defaultPromptTierForTask`、`defaultValidatePolicyForTask`）：根据任务类型提供默认配置。

## 重要不变性与否定范围
- **必须保持纯重新导出外观** – 不包含任何内部逻辑或算法实现。
- **不得吸收**服务、任务或引擎编排的关注点。
- **不涉及**：提示工件生成、直接解析/解析算法实现以及基础设施级能力。

## 公共接口
- `LLM_MODES`
- `PROMPT_POLICY_TIERS`
- `STRICT_VALIDATE_BUDGET_PROFILES`
- `VALIDATE_POLICIES`
- `PROMPT_BUDGET_PROFILES`
- `parseLLMMode`
- `parsePromptPolicyTier`
- `parseRelevanceDiagnosticsMode`
- `parseValidatePolicy`
- `defaultPromptTierForTask`
- `defaultValidatePolicyForTask`
- `resolvePromptPolicyTier`
- `resolveValidatePolicy`

## 架构意图
该外观层通过将策略常量和解析工具与更广泛的提示上下文关注点分离，减少了导入开销并提高了模块化程度。它符合明确子系统边界和解决层反转的架构目标。