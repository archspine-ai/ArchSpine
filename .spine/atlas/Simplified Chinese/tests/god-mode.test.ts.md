<!-- spine-content-hash:f88558db01bc5a9cb25a5fa79ebbe0de34c9b9ae4fa4c1d72fe4b096c88efba8 -->
# ArchSpine God Mode 集成测试套件

## 角色
ArchSpine 中 God mode 档案功能的 Vitest 集成测试套件。

## 主要职责
- 创建临时测试目录，写入模拟项目文件和配置，以模拟真实的 ArchSpine 项目。
- 通过 `child_process.execSync` 执行 CLI 命令，测试 God mode 命令。
- 使用模拟的 LLM 提供程序 (MockClient) 验证 God mode 命令的执行和输出行为。
- 每次测试运行后清理临时测试目录。

## 重要不变性与负面范围
- **不变性：** 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：test-file-suffix）。
- **不涉及范围：**
  - 对 God mode 引擎各个功能的单元测试。
  - 对生产环境 LLM 提供程序集成的测试。
  - 对 God mode 功能之外的其他 CLI 命令的测试。

## 导出的 / 外部可见行为
此文件不导出任何公共 API 接口。它是一个作为 Vitest 框架一部分运行的测试套件，不供外部使用。