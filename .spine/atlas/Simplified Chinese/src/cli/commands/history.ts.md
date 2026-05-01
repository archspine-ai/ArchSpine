<!-- spine-content-hash:b4c44c4c165132a7fa9b159eeac887f79bdf95879273d58462dd57837f9ff199 -->
# ArchSpine – `spine history` CLI 命令适配器

## 角色
该模块是 `spine history` 子命令的 CLI 命令适配器，负责解析参数、委托 Manifest 基础设施获取漂移历史和文件文档记录，并格式化输出到终端。

## 主要职责
- 解析并验证 `history` 子命令的 CLI 参数，强制要求提供单个文件路径参数。
- 通过 `Manifest.open` 打开项目清单以访问持久化的仓库状态。
- 从清单中检索指定文件路径的漂移历史记录。
- 从清单中检索指定文件路径的文件文档条目。
- 格式化并打印漂移历史条目，包含时间戳、状态和文件路径详情。
- 格式化并打印文件文档条目，包含时间戳和内容。

## 不涉及范围
- 漂移历史或文件文档的持久化或存储逻辑。
- 计算或检测语义漂移的业务逻辑。
- 超出 CLI 命令执行的任何管道编排。

## 不变约束
- CLI 入口点不得吸收管道或持久化逻辑（cli-entrypoint-separation）。

## 公开接口
- `executeHistoryCommand(options: ExecuteHistoryCommandOptions): Promise<void>`
- `ExecuteHistoryCommandOptions` 接口

## 架构意图
提供一个 CLI 命令来检查指定文件路径的漂移历史和文件文档，使开发者能够随时间审计变更和文档。

## 近期变更意图
解决 lint 错误并在 v1.0 前完成管道修复——可能涉及细微的格式化或错误处理调整。