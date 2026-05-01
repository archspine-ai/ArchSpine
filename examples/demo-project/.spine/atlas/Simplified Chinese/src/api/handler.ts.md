# File: src/api/handler.ts

## 角色
API 请求处理程序与入口点

## 职责
- 通过与领域服务交互，协调用户创建请求。
- 定义 `CreateUserHandler` 类以管理传入的请求负载。
- **注意**：目前包含对 `infra/database` 的直接依赖，这在注释中被标记为架构违规。
- 作为外部调用者与内部系统逻辑之间的主要边界。