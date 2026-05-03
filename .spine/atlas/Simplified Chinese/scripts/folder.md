# scripts/ – 自动化与工具脚本

该目录存放了支持 ArchSpine 开发生命周期的全部自动化和工具脚本。其内容按功能分为若干组：构建与监视流程、端到端验证、协议验证、数据库模式迁移、占位符发布、发布门控检查以及终端演示录制。

值得关注的具体子组件包括：

* **构建脚本** – `build.mjs` 将 TypeScript 编译为 JavaScript，复制规则和资源文件，清理模拟目录，并为 CLI 入口设置可执行权限。`dev-build.mjs` 监视源码目录和配置文件，检测到更改后触发重建，并防止构建冲突。
* **验证脚本** – `final-verify.mjs` 对 ASTExtractor 进行端到端验证，覆盖 Java、C++、Rust、C、Python 和 Go 的测试夹具，检查继承、泛型、结构体、trait 等特性。`validate-protocol-assets.mjs` 加载 JSON Schema 定义，验证示例文件，并处理 Markdown 前置元数据。
* **数据库模式迁移** – `update-db-schema.cjs` 管理缓存数据库（cache database）的模式更新，确保 `mtime` 和 `size` 列存在，并安全处理重复添加列的情况。
* **发布与发布门控** – `publish-placeholder.mjs` 自动执行初始的 npm 包发布，包含元数据校验和包名冲突检查。`release-gate.mjs` 编排依次执行的流水线（构建、单元测试、模式测试、协议验证、打包检查），任一环节失败即终止。
* **演示录制** – `demo.tape` 与 `project-demo.tape` 提供 VHS 脚本来录制终端演示，展示 `sync`、`check`、`fix` 等 CLI 命令。

最关键的实现领域包括构建稳定性、多语言 AST 验证，以及保障部署质量的发布门控管道。