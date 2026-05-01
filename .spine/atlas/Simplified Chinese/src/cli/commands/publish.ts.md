<!-- spine-content-hash:53452e47c5aa276fa3a8d5816eef961a106e3d9cffadaa8fec5db50472871a94 -->
# ArchSpine 发布命令处理器

## 角色
ArchSpine 镜像系统发布工作流的 CLI 命令处理器，协调预检、同步、文档回填和 Atlas 状态管理。

## 主要职责
- 通过运行时基线和快照就绪断言验证发布前置条件。
- 如果从本地 Git 策略发布，则发出警告以防止意外分发。
- 执行同步工作流以确保 Atlas 在发布前是最新的。
- 运行 DocumentBackfillTask 来回填缺失的文档。
- 通过 `Manifest.open(rootDir).clearAtlasStale()` 清除过时的 Atlas 数据以确保干净的发布状态。
- 与 RuntimeService、Config 和运行时 IO 协调以执行发布命令。

## 不涉及范围
- 直接的数据库或持久层操作（例如原始查询、索引管理）。
- LLM 客户端解析或模型配置细节。
- 特定语言的翻译或生成逻辑。
- 快照创建或版本控制逻辑。

## 不变约束
- CLI 入口点不得吸收管道或持久化逻辑；应委托给服务层、核心层、引擎层或基础设施层。
- 任何发布操作前必须执行预检检查。
- 同步工作流必须在发布前成功完成。

## 公开接口
- `ExecutePublishCommandOptions`（接口）

## 值得注意的违规
发布命令处理器直接导入并调用了 `DocumentBackfillTask`（任务）和 `Manifest.open(rootDir).clearAtlasStale()`（持久化逻辑）。这违反了 CLI 模块应保持为薄入口点、不吸收管道或持久化逻辑的规则。这些职责应委托给服务层或引擎层。

## 检测到漂移
是。先前的语义契约未包含运行 `DocumentBackfillTask` 或通过 `Manifest` 清除过期 Atlas 数据的职责。当前实现添加了这些管道/持久化操作，表明存在语义漂移。