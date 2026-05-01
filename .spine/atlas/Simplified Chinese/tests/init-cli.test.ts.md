<!-- spine-content-hash:b1a7ff01ef0f2f7478370e46cd9bb447e72f1a4a56340ec06f446f19d06e365e -->
# ArchSpine – CLI 初始化测试工具模块

## 角色
用于 CLI 初始化集成测试的 Vitest 测试工具模块。

## 主要职责
- 提供临时目录的创建和清理功能，用于隔离的测试环境。
- 生成包装脚本，注入模拟的用户提示，用于 CLI 测试。
- 设置测试夹具并执行构建后的 CLI 二进制文件，使用受控输入。

## 重要不变性与负面范围
- 临时目录在操作系统临时目录下创建，并使用一致的前缀。
- 包装脚本写入磁盘并通过 child_process 执行。
- 构建后的 CLI 二进制文件路径相对于仓库根目录解析。
- **不在范围内：** 不包含实际的测试用例或断言。不实现 CLI 逻辑或提示处理。不管理持久状态或配置。

## 公开接口
- `makeTempDir(): string` – 创建并返回一个新的临时目录路径。
- `writeWrapperScript(wrapperPath: string, cliArgs: string[], injectedAnswers: unknown[]): void` – 将包装脚本写入磁盘，该脚本使用给定的参数和注入的答案运行 CLI。