<!-- spine-content-hash:d15b57c1890b9f1f4422795a4551c2fe52892bf205a43ea96025eec90b8d7d24 -->
## FixTask – 架构自动修复阶段

**角色**  
`FixTask` 是 `SpineTask<FixStageInput, FixStageOutput>` 的实现，用于流水线中由 LLM 驱动的架构违规自动修复阶段。该任务在检测到违规后触发，负责生成并应用修复补丁。

**主要职责**  
- 按源文件对架构规则违规进行分组，以便批量处理每个文件。  
- 针对每个违规文件，利用 AST 分析（通过 `@ast-grep/napi`）生成 LLM 提示，从而产生修复补丁。  
- 使用 `createTwoFilesPatch`（diff 工具）验证补丁，然后应用到源文件。  
- 补丁应用后，重新评估架构规则，确保违规已解决。  
- 管理每个文件修复的检查点生命周期（开始、完成、跳过、失败）。  
- 汇总最终结果为 `FixStageOutput` 对象，包含已修补的违规和无法修复的违规。

**关键不变性**  
- 生成修复提示前，违规必须按源文件分组。  
- 补丁必须经过验证才能应用，防止文件损坏。  
- 每次补丁应用后，必须重新检查文件是否有剩余违规。  
- 该阶段严格遵守任务‑阶段边界规则：不处理 CLI 参数解析或无关编排。

**不包含范围**  
- 命令行解析或参数处理。  
- 修复阶段以外的服务编排。  
- 除了通过 `ctx.runtimeIO` 的基本日志记录外，不涉及 UI 或终端渲染。  
- 不直接加载规则或实例化引擎（使用 `ctx.ruleEngine`）。

**公开接口**  
- 类 `FixTask extends SpineTask<FixStageInput, FixStageOutput>`  
- `name = 'Architectural Auto-fix'`  
- `checkpointId = 'fix'`  
- 常量：`MAX_SCANS`，`MAX_FILE_SIZE_BYTES`