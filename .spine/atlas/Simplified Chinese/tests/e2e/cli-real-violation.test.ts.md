<!-- spine-content-hash:382f8edf82648bc32a3b580a078840fb7aef0e25acbed77da9c0d01ef3cb9b04 -->
该文件是基于 Vitest 的 ArchSpine CLI 端到端（E2E）集成测试，用于在隔离的 Git 仓库中验证 CLI 的执行以及规则违规检测能力。

**主要职责：**
- 使用 `fs.mkdtempSync` 创建临时目录，提供完全隔离的测试环境。
- 初始化裸 Git 仓库，并配置测试用户身份信息。
- 通过 `fs.writeFileSync` 程序化地写入项目配置文件（如 `archspine.json`）。
- 使用 `child_process.execFileSync` 或 `spawnSync` 执行编译后的 CLI 二进制文件（`dist/cli/index.js`）。
- 利用 Vitest 断言验证 CLI 的退出码和标准输出/错误输出。
- 每次测试后清理临时目录（通过 OS 临时文件清理或 Vitest 生命周期钩子实现）。
- 通过配置 prompts 模块路径来模拟用户输入。

**重要不变性：**
- 所有测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。

**不涵盖的内容（负面范围）：**
- 对源码中单个函数或模块的单元测试。
- 在临时测试目录之外直接操作文件系统。
- 跨平台兼容性测试（尽管整体测试意图包含，但该代码本身是平台无关的）。

**最重要的外部可见行为：**
该文件不导出任何公共 API 或组件。它的核心贡献在于定义的测试用例集合，每个用例验证 CLI 的特定行为及规则违规检测场景。这些测试是 CLI 在受控环境中正确性的权威验证依据。