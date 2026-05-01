<!-- spine-content-hash:95c6ab6cc6a65ab2f67d306b1446ef535bf7f09daa7c62343aaf8780734d6991 -->
# ArchSpine – 提示上下文外观模块

## 角色
本模块是提示上下文子系统的**公共外观**。它为策略常量、预算配置文件、构件构建和解析函数提供单一、稳定的导入接口，将调用者与内部实现变更隔离开来。

## 主要职责
- 从内部 prompt-policy 模块重新导出所有公共常量：
  - `LLM_MODES`
  - `PROMPT_POLICY_TIERS`
  - `STRICT_VALIDATE_BUDGET_PROFILES`
  - `VALIDATE_POLICIES`
  - `PROMPT_BUDGET_PROFILES`
- 从内部 artifacts 模块重新导出构件构建函数：
  - `buildSourcePromptArtifacts`
  - `calculateSourcePromptBudgets`
- 从内部 diagnostics 模块重新导出解析函数：
  - `parseLLMMode`
  - `parsePromptPolicyTier`
  - `parseRelevanceDiagnosticsMode`
  - `parseValidatePolicy`
- 从内部 resolution 模块重新导出默认策略解析函数：
  - `defaultPromptTierForTask`
  - `defaultValidatePolicyForTask`
- 从内部 resolution 模块重新导出策略解析函数：
  - `resolvePromptPolicyTier`
  - `resolveValidatePolicy`
- 作为所有提示上下文消费者的**唯一导入目标**，将其与内部重构隔离开来。

## 重要不变性
- **所有导入必须通过本外观** – 调用者不得直接从 `src/infra/prompt-context/*` 内部路径导入。
- **本模块不定义任何新逻辑** – 每个导出都是纯粹的重新导出。
- 本模块**不得**吸收服务、任务或引擎编排的关注点（根据 infra-facade-imports 规则）。

## 不涉及范围
- 提示策略计算或预算逻辑的实现细节。
- 服务或引擎任务的直接编排。
- 运行时状态管理或会话处理。

## 公共接口（导出的符号）
`LLM_MODES`、`PROMPT_POLICY_TIERS`、`STRICT_VALIDATE_BUDGET_PROFILES`、`VALIDATE_POLICIES`、`PROMPT_BUDGET_PROFILES`、`buildSourcePromptArtifacts`、`calculateSourcePromptBudgets`、`parseLLMMode`、`parsePromptPolicyTier`、`parseRelevanceDiagnosticsMode`、`parseValidatePolicy`、`defaultPromptTierForTask`、`defaultValidatePolicyForTask`、`resolvePromptPolicyTier`、`resolveValidatePolicy`

## 漂移说明
本外观已超出其原始契约范围，新增了预算计算、解析和解析函数。先前的语义契约未列出这些导出；它们已被添加以提供完整的公共接口。