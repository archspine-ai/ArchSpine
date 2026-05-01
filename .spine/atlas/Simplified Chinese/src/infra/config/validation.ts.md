<!-- spine-content-hash:5bd0d2245014d581cfabba9e42c446bfa62509f66e9283d91698d5a506dd1b3e -->
# ArchSpine – 配置验证外观模块

## 角色
Spine 配置负载的基础设施验证外观模块。

## 主要职责
- 使用核心配置模式解析器验证未知负载是否符合 Spine 配置模式。
- 验证成功时返回类型化的 `SpineConfig` 对象，失败时返回 `null`。
- 验证失败时向控制台输出结构化的警告信息，包含配置路径和问题详情。
- 提供辅助函数，使用 `ErrorCodes.ConfigParseFailed` 构建验证和解析失败的格式化警告字符串。

## 不涉及范围
- 从磁盘解析或读取配置文件。
- 从外部来源加载或解析配置。
- 编排服务或任务初始化。
- 处理运行时配置重载或热重载逻辑。

## 不变规则
- 基础设施模块必须暴露稳定的底层能力和外观，不应吸收服务/任务/引擎的编排职责（规则：`infra-facade-imports`）。
- 调用者应优先使用公共基础设施外观，而非深入私有实现路径（规则：`infra-facade-imports`）。

## 公开接口
- `validateConfigPayload(configPath: string, payload: unknown): SpineConfig | null`
- `buildConfigValidationWarning(configPath: string, issues: string[]): string`
- `buildConfigParseWarning(configPath: string, reason: string): string`

## 变更意图
- **架构意图：** 为 Spine 配置负载提供稳定的底层验证外观，将配置验证与高层编排逻辑解耦。
- **近期变更意图：** 修复 lint 警告和类型错误，并添加 CI 工作流（对本文件逻辑无直接影响）。

## 漂移检测
- **检测到漂移：** 否
- **漂移原因：** 无
- **规则违反：** 无