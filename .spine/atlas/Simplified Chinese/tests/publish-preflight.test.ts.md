<!-- spine-content-hash:da610b0f4e0798517cacedc60a8bb68354a338e57136a94f40c7f0a3f42ce205 -->
# ArchSpine 发布预检集成测试套件

## 角色
这是一个用于发布预检服务的 Vitest 集成测试套件。它在隔离的项目环境中验证运行时断言和锁序列化，确保服务在部署前行为正确。

## 主要职责
- 创建隔离的临时目录以模拟 ArchSpine 项目根结构。
- 调用构建后的 CLI 可执行文件，端到端测试发布运行时基线断言。
- 验证 `assertPublishRuntimeBaseline` 在缺少或格式错误的脊柱配置时抛出适当的 `ArchSpineError` 实例。
- 使用模拟的清单和锁文件测试 `assertPublishSnapshotReady`，确保快照就绪检查。

## 重要不变性
- 依赖 Vitest 测试框架进行结构和断言。
- 假设构建后的 CLI 位于 `dist/cli/index.js`。
- 在隔离的临时目录中运行，避免副作用。
- 遵循测试文件后缀规则（`.test.ts`）。

## 负面范围（不涉及）
- 不单独对单个工具函数（如 `serializeLockPayload`）进行单元测试。
- 不测试非发布相关的服务或 CLI 命令。
- 不涵盖生产运行时逻辑；这是一个测试套件。

## 最重要的导出行为
- `makeTempDir()`：创建用于隔离测试的临时目录。
- `makeRuntimeBaseline(rootDir: string): void`：在指定根目录中设置运行时基线。