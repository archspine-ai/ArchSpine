<!-- spine-content-hash:237363c71acc6a9b577d4fd3b49bee914f9ee849216368fd7765e32d6cff182b -->
# ArchSpine – 检查子系统公共 API 桶模块

## 角色
检查子系统的公共 API 桶模块，重新导出核心服务和 CLI 运行器。

## 主要职责
- 暴露 `CheckService` 类供程序化使用。
- 暴露 `runCheck` 函数作为主要 CLI 入口点。
- 重新导出 `ValidationSummary` 类型以确保消费者类型安全。

## 不涉及范围
- 实现检查逻辑或验证规则。
- 提供配置或编排。
- 处理 CLI 参数解析或用户交互。

## 重要不变性
- 只能从内部模块重新导出符号。
- 不得包含业务逻辑或副作用。

## 公共接口
- `CheckService`
- `runCheck`
- `ValidationSummary`