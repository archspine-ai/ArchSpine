<!-- spine-content-hash:c94b0f63a8aec23960a4b9aa23b327da190b0065e7f58db99ed754e65862f010 -->
# ArchSpine – `fix` CLI 命令适配器

## 角色
本模块是 `fix` 操作的 CLI 命令适配器，将所有执行委托给运行时服务的修复子系统外观，保持命令层与业务逻辑的解耦。

## 主要职责
- 定义 `ExecuteFixCommandOptions` 接口，该接口需要 `RuntimeService` 实例以进行依赖注入。
- 在控制台输出实验性警告，提醒用户修复功能是生成式的，可能产生意外变更。
- 通过调用 `runtimeService.getFixService().run()` 执行修复命令，并等待结果。
- 如果修复操作报告仍有架构违规，则抛出 `ArchSpineError`，错误代码为 `CliCommandFailed`。

## 重要不变性与负面范围
- **必须保持为薄适配器** – 所有业务逻辑、管道编排和持久化都委托给运行时服务。
- **不得吸收** 修复逻辑、管道步骤、引擎职责或数据访问关注点。
- **不处理** 用户输入解析或 CLI 参数验证；这些由上游负责。

## 公开接口
- `ExecuteFixCommandOptions` 接口
- `executeFixCommand` 函数

## 变更意图
架构意图是将 CLI 命令路由与核心修复逻辑分离，以保持可测试性和可复用性。最近的变更侧重于收紧模式处理并添加尝试预览功能（尽管当前文件代码中未直接体现）。

## 漂移检测
未检测到漂移。不存在规则违规。