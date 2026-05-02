<!-- spine-content-hash:cf13e45975a8d33f0dc6427f9088b023e2327f786a2ab128011f9805347cccd5 -->
## FixTask – 架构自动修复阶段

`FixTask` 类（继承 `SpineTask<FixStageInput, FixStageOutput>`）实现了流水线中由 LLM 驱动的自动化架构违规修复阶段。其主要职责是自动修复违反架构规则的源文件，通过生成并应用语言模型产生的补丁。

### 主要职责
- 按源文件对架构规则违规进行分组，以便批量处理。
- 利用 `@ast-grep/napi` 进行 AST 分析，为每个违规文件生成 LLM 提示以产生修复补丁。
- 在将补丁应用于源文件之前，使用 `createTwoFilesPatch`（diff 工具）验证生成的补丁。
- 通过规则引擎重新评估规则，确认违规已解决后，对已修复文件进行复检。
- 管理每个文件修复的检查点生命周期（状态：开始、完成、跳过、失败）。
- 汇总结果至 `FixStageOutput`，列出已修补的违规和无法修复的违规。

### 不涉及范围
- CLI 命令解析和参数处理。
- 修复阶段以外的服务编排。
- 除通过 `ctx.runtimeIO` 进行基本日志记录之外的 UI 或终端渲染。
- 直接规则加载或引擎实例化（使用 `ctx.ruleEngine`）。

### 约束与重要行为
- **必须**在生成修复提示前按源文件对违规进行分组。
- **必须**在应用补丁前验证其有效性，以防止文件损坏。
- 应用补丁后，**必须**重新检查文件以确保所有违规已解决。
- 本阶段遵守任务-阶段边界规则：不接管无关的 CLI 或编排任务。

### 变更意图
- **架构意图：** 在受限的流水线阶段内，使用 LLM 生成的补丁自动修复架构规则违规。
- **近期修复：** 解决了 FixTask 中的 TTY 挂起、检查点重试崩溃、`--yes` 传播以及 Windows 兼容性问题。

### 公开表面
- `FixTask` 类：`SpineTask<FixStageInput, FixStageOutput>`
- `name = 'Architectural Auto-fix'`
- `checkpointId = 'fix'`
- 常量：`MAX_SCANS`，`MAX_FILE_SIZE_BYTES`