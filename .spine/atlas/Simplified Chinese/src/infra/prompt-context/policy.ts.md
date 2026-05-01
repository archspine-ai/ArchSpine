<!-- spine-content-hash:7ceb4309b7ebd0efb4726aa5f71f9ba720c4ad8e701a7b0e3af60d977ba9bf7b -->
# ArchSpine – 策略解析器（基础设施外观）

## 角色
该模块是一个**基础设施策略解析器**，根据当前任务模式提供默认的提示策略和验证策略。它作为一个稳定、解耦的外观层，供系统中其他模块查询策略决策，而无需了解底层的解析逻辑。

## 主要职责
- **默认提示层级**：为给定的 `PromptTaskMode` 确定默认的提示策略层级（例如 `"balanced"`）。
- **默认验证策略**：为给定的 `PromptTaskMode` 确定默认的验证策略（例如 `"strict"`、`"default"`）。
- **策略解析（支持覆盖）**：解析提示策略层级，并可选择性地考虑覆盖值（部分函数已展示）。
- **稳定外观**：将策略决策函数作为干净、稳定的 API 暴露给其他模块使用。

## 重要不变性与负面范围
- **纯函数库**：必须保持为纯函数库，**无副作用**。不得进行状态变更、I/O 操作或外部调用。
- **不涉及编排**：**不得**吸收服务编排相关功能（例如任务执行、引擎工作流）。这严格是一个策略解析器。
- **无运行时状态**：不管理运行时状态、配置加载或用户输入解析。
- **稳定导出**：导出的函数（`defaultPromptTierForTask`、`defaultValidatePolicyForTask`、`resolvePromptPolicyTier`）必须提供稳定、可预测的策略解析外观。

## 导出/公开接口
- `defaultPromptTierForTask(taskMode: PromptTaskMode): string` – 返回给定任务模式的默认提示层级。
- `defaultValidatePolicyForTask(taskMode: PromptTaskMode): string` – 返回给定任务模式的默认验证策略。
- `resolvePromptPolicyTier(taskMode: PromptTaskMode, override?: string): string` – 解析提示策略层级，如果提供了覆盖值则应用该覆盖。

## 架构意图
该模块是 CLI 模块化和核心基础设施解耦这一更广泛工作的一部分。它提供了一个一致、集中的策略解析点，确保所有任务根据其模式获得相同的默认策略。这减少了重复，并使策略变更更易于管理。