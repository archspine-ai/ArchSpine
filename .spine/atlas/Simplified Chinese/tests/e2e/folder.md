此目录是 **ArchSpine 命令行接口（CLI）的端到端集成测试套件**。它通过在隔离的临时环境中运行编译后的 CLI 二进制文件，验证所有主要 CLI 命令和工作流的正确性，包括标准输出、标准错误、退出代码以及文件系统副作用。

测试文件按覆盖的命令或场景分组：

- **核心命令测试**  
  - `cli-config.test.ts` – 通用 CLI 编排、配置与参数处理。  
  - `cli-init-advanced.test.ts` – `init` 命令，通过包装脚本模拟用户交互输入。  
  - `cli-readonly.test.ts` – 只读命令（如 inventory 和 generation），以及 JSON 输出验证。  
  - `cli-remove.test.ts` – `remove` 命令，包含提示模拟与 Git 工作流验证。  
  - `cli-repo.test.ts` – 仓库级命令（`init`、`build`），在临时 Git 仓库中执行。

- **管道与 LLM 测试**  
  - `cli-pipeline-mock.test.ts` – 端到端管道执行，拦截 prompts 模块以模拟用户输入。  
  - `cli-real-llm.test.ts` – 真实 LLM 集成测试（需要 API 密钥），验证在真实模型下的生成行为。

- **规则违规检测**  
  - `cli-real-violation.test.ts` – 强制验证规则违规被正确检测并报告，包括退出码断言。

所有测试均使用 Vitest、`child_process.spawnSync`/`execFileSync` 和 `fs.mkdtempSync` 确保隔离性与可重现性。最重要的实现领域包括：自动化的提示模拟包装脚本、临时目录的生命周期管理（通过 `beforeAll`/`afterEach` 进行设置与清理），以及针对预期错误信息和文件系统结果的 CLI 行为精确断言。