<!-- spine-content-hash:f549b4b475bdefa91a5dfdfa015bc9bfc548412e5f512a4b1a141f38cd51e15e -->
# ArchSpine 提示策略配置

本模块是 ArchSpine 提示策略系统的**集中配置中心**，定义了类型化常量和预算配置文件，用于规范系统中提示的结构和验证方式。

## 角色

ArchSpine 提示策略系统的集中配置模块，定义类型化常量和预算配置文件。

## 主要职责

- 导出有效的提示策略层级（`'lite'`、`'balanced'`）、验证策略和 LLM 模式的类型化数组，用于运行时验证和迭代。
- 提供一个结构化记录，将每个策略层级和任务模式映射到详细的提示预算配置文件，包含行数、导入和导出约束。
- 作为提示预算配置的单一事实来源，确保系统范围内一致的策略执行。

## 不涉及范围

- 提示预算的运行时执行或验证。
- 加载或解析外部配置文件。
- 任何与 LLM 调用或提示生成相关的逻辑。

## 不变约束

- 所有导出的数组和记录必须与 `./types.js` 中定义的类型保持一致。
- `PROMPT_BUDGET_PROFILES` 记录必须覆盖 `PromptPolicyTier` 和 `PromptTaskMode` 的每一种组合。

## 公开接口

- `PROMPT_POLICY_TIERS`
- `VALIDATE_POLICIES`
- `LLM_MODES`
- `PROMPT_BUDGET_PROFILES`

## 变更意图

架构意图是将提示策略配置集中到单一的类型化模块中，以确保系统的一致性和易维护性。当前未检测到近期变更；该文件在当前的 git 状态中保持稳定且未修改。