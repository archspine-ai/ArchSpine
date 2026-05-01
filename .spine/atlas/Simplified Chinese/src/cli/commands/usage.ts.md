<!-- spine-content-hash:336ea48d7cb3168eec98edf18f78d6d427c3b29064d92c9d788766052ccfe60a -->
# ArchSpine – 使用命令入口点

## 角色
用于执行使用报告的 CLI 命令入口点。

## 主要职责
- 通过 `ExecuteUsageCommandOptions` 接口定义使用命令的命令行界面选项。
- 将执行委托给使用引擎（`runUsageReport`），并提供指定的根目录和默认运行时 I/O。

## 重要不变性与负面范围
- 必须保持为薄适配器，将所有实质性工作委托给使用引擎。
- 不得吸收来自引擎或基础设施的管道、持久化或业务逻辑。
- 管道或持久化逻辑属于引擎、服务、核心或基础设施。
- 生成使用报告的业务逻辑不在范围内。
- 运行时 I/O 实现或配置不在范围内。

## 最重要的导出/外部可见行为
- `ExecuteUsageCommandOptions` 接口
- `executeUsageCommand` 函数