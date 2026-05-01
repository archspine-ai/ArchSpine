<!-- spine-content-hash:402751d643581f3d34615f7926d639df66559d838c23981ee7101e45a433cb17 -->
# ArchSpine 凭据存储

## 角色
基础设施模块，提供安全的凭据存储，支持可插拔后端和基于文件的回退安全机制。

## 主要职责
- 通过可插拔后端（如系统钥匙串）管理 LLM API 密钥和其他凭据。
- 当主后端不可用时，提供安全的文件回退存储。
- 验证并修剪密钥值以确保数据完整性。
- 通过 `.gitignore` 分析，在回退密钥可能被版本控制跟踪时发出警告。
- 暴露工厂函数（`createProjectLLMCredentialStore`、`createGlobalLLMCredentialStore`），方便创建项目级或全局范围的存储实例。

## 重要不变性
- 基础设施模块应暴露稳定的底层能力和外观，不得吸收服务/任务/引擎编排的关注点。
- 调用者应优先使用公共基础设施外观，而不是在存在外观时深入私有实现路径。

## 负面范围（不涉及）
- 不处理身份验证或授权逻辑。
- 不管理网络请求或 API 调用。
- 不实现 LLM 使用或编排的业务逻辑。
- 不提供 UI 或用户交互组件。

## 公共接口
- `CredentialStore`（类）
- `createProjectLLMCredentialStore`（函数）
- `createGlobalLLMCredentialStore`（函数）
- `CredentialSource`（类型）
- `FileCredentialShape`（接口）