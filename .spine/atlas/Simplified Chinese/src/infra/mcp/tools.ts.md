<!-- spine-content-hash:2136d2c142f15cdd28bb04341be6cae1df0ca300161fce70fff59af18fc4d6d9 -->
# ArchSpine MCP 工具外观层

## 角色
该模块作为 **MCP（模型上下文协议）工具外观层**，将 ArchSpine 系统能力暴露为可供外部 AI 代理查询的工具。它为代理提供了一个稳定、可查询的接口，用于内省系统的架构、规则和漂移历史。

## 主要职责
- 提供用于查询代码库架构不变量和职责的工具实现。
- 暴露预览扫描功能，用于分析文件是否符合已加载的架构规则。
- 提供对漂移历史和资源模板的访问，用于系统内省。
- 将核心系统组件（Scanner、Manifest、Config、Rules）封装在统一的工具接口之后。
- 管理 MCP 上下文门，用于工具调用跟踪和审计。

## 不包含的范围
- 超出读取 `.spine` 目录内容的直接文件系统操作。
- 架构规则执行或策略决策的实施。
- 用户身份验证或授权逻辑。
- 扫描结果或工具调用历史的持久化存储。

## 重要不变量
- 所有工具方法必须通过 `MCPContextGate.noteToolCall` 进行审计。
- 错误必须使用 `toArchSpineError` 进行包装，以确保错误处理的一致性。
- 工具操作必须依赖 `.spine` 目录的存在。
- 基础设施模块应暴露稳定的底层能力和外观，不得吸收服务/任务/引擎编排的关注点。

## 公开接口
- `SpineTools(rootDir, manifest?, contextGate?)`
- `SpineTools.queryInvariants()`
- `SpineTools.queryResponsibilities()`
- `SpineTools.previewScan()`
- `SpineTools.getDriftHistory()`
- `SpineTools.listResourceTemplates()`

## 变更意图
架构意图是为外部 AI 代理提供一个稳定、可查询的工具接口，用于内省 ArchSpine 系统的架构、规则和漂移历史。最近的变更包括修复 lint 警告和类型错误，并添加了用于自动验证的 CI 工作流。

## 漂移状态
未检测到漂移。不存在规则违规。