<!-- spine-content-hash:39637b04fd19f6be2ab3acb82b0ca29fa589f1019937949a56c6c2bfa043f8a6 -->
# ArchSpine MCP 上下文门控集成测试

本 Vitest 集成测试套件用于验证 ArchSpine 系统中的 MCP 上下文门控机制，确保资源和工具的访问权限能够根据 MCP 上下文的初始化状态得到正确限制。

## 主要职责

- **隔离测试环境**：为每个测试用例创建临时目录，模拟真实项目环境，避免副作用。
- **上下文门控验证**：测试 `MCPContextGate` 的行为，确认只有在上下文正确初始化时，资源和工具才可访问。
- **策略执行检查**：验证 `SpineResources` 和 `SpineTools` 是否遵循 `MCPContextGate` 定义的上下文门控策略。
- **生命周期管理**：使用 `beforeEach` 和 `afterEach` 钩子来设置和清理干净的测试环境。

## 重要不变性

- 该文件必须是 Vitest 测试文件，后缀为 `.test.ts`。
- 必须导入并测试 `MCPContextGate`、`SpineResources` 和 `SpineTools`。
- 必须管理临时测试目录，避免测试之间的副作用。

## 不涉及范围

- MCP 上下文门控的生产运行时逻辑。
- MCP 协议服务器或客户端的实现。
- 用户界面或命令行交互。

## 架构意图

主要目标是严格测试 MCP 上下文门控，防止在 ArchSpine 系统中出现未经授权的资源或工具访问。该测试套件是最终版本（v1.0.0）发布准备的一部分，旨在确保测试套件的稳定性和覆盖率。