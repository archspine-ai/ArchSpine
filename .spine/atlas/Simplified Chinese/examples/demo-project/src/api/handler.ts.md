<!-- spine-content-hash:c5a14a5505bff0d05ade8b54362dab8084656003e1b646b4103cd8b1b21ac0e6 -->
# CreateUserHandler – API 处理器

## 角色
该文件作为用户创建操作的 HTTP 入口点。

## 主要职责
- 接收用户创建的 HTTP 请求。
- 将用户创建逻辑委托给 `UserService` 领域服务。
- 直接管理数据库连接生命周期（注意：这违反了分层架构）。

## 不包含的内容
- 用户验证或创建的业务逻辑（由 `UserService` 处理）。
- 持久化实现细节（由数据库基础设施处理）。

## 重要不变性
- 必须从领域层导入 `UserService`。
- 导出 `CreateUserHandler` 类作为公共 API。

## 公共接口
- `CreateUserHandler` 类

## 架构意图
该处理器旨在作为用户创建的 HTTP 入口点，将所有领域逻辑委托给 `UserService`。此文件未检测到最近的更改。