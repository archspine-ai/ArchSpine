## ArchSpine CLI 集成测试目录 (`tests/integration/`)

本目录包含 ArchSpine CLI 的端到端集成测试套件。所有测试均使用 TypeScript 编写，基于 [Vitest](https://vitest.dev/) 框架，通过在临时隔离环境中运行编译后的 CLI 二进制文件进行验证。测试模拟真实的用户交互，检查正确的输出和退出码，并在每次运行后清理所有测试产物。

### 主要子文件及其分组

测试文件根据所测试的 CLI 命令或场景进行分组：

- **`cli-config.test.ts`** – 通用 CLI 配置与输出验证（共 7 个文件，37 个测试用例）。  
- **`cli-init-advanced.test.ts`** – `init` 命令的高级行为，包括交互式提示模拟。  
- **`cli-pipeline-mock.test.ts`** – 使用模拟提示模块的端到端流水线流程。  
- **`cli-readonly.test.ts`** – 只读命令（清单、验证）及文件生成输出测试。  
- **`cli-real-llm.test.ts`** – 在临时 Git 仓库中集成真实大语言模型（LLM）的测试。  
- **`cli-real-violation.test.ts`** – 使用裸 Git 仓库检测规则违规的测试。  
- **`cli-remove.test.ts`** – `remove` 及相关命令的测试，配合提示模拟。  
- **`cli-repo.test.ts`** – 仓库级命令（`init`、`build`）在子进程中的测试。

### 关键实现领域

- **隔离的 Git 仓库** – 每个测试通过 `fs.mkdtempSync` 创建临时目录，并经常初始化一个指定分支和用户配置的 Git 仓库，确保干净、可重复的环境。
- **提示模拟** – 为模拟交互式输入，测试编写包装脚本以拦截或替代 `prompts` 模块，实现自动化非交互执行。
- **二进制程序启动** – 所有测试使用 `child_process.spawnSync` 或 `execFileSync` 运行编译好的 CLI 二进制文件（`dist/cli/index.js`），并传入受控参数。
- **生命周期管理** – 借助 Vitest 的 `beforeAll` 和 `afterEach` 钩子，测试搭建初始脚手架（如 `archspine.json`）并在每次测试后清理临时目录，避免磁盘污染。
- **副作用断言** – 测试不仅验证标准输出和错误输出，还检查文件创建、目录结构以及 CLI 命令的 JSON 输出。

这些套件共同确保了 ArchSpine CLI 在初始化、生成、移除、流水线执行及违规检测等各项工作流程中的可靠性。