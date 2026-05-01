<!-- spine-content-hash:c8150a304a5d1fe54fb633941b1a3de60d095b143c04007070d521364e10190a -->
# ArchSpine 状态命令适配器

## 角色
用于显示 ArchSpine 镜像系统同步状态的 CLI 命令适配器。

## 主要职责
- 提供命令接口（`ExecuteStatusCommandOptions`），用于依赖注入运行时服务外观。
- 通过注入的运行时服务外观调用同步服务的状态方法。
- 将同步状态（总文件数、需要同步的文件数、失败数）格式化并输出到控制台。
- 处理错误，将其转换为 `ArchSpineError` 实例，以实现一致的 CLI 错误报告。

## 重要不变性
- 必须保持为薄 CLI 适配器，将所有业务逻辑委托给运行时服务。
- 不得直接导入或使用持久化、管道或引擎模块。

## 负面范围（不涉及）
- 直接与文件系统或持久化层交互。
- 计算同步状态的业务逻辑。
- 管道编排或数据转换。

## 公开接口
- `ExecuteStatusCommandOptions`
- `executeStatusCommand`