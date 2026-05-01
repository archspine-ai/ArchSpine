<!-- spine-content-hash:fea1d71ca595291cf5037c1fe213bcd42854fd2d162a6271478dfeaf5c89fc5f -->
# ArchSpine 配置兼容性测试套件

本 Vitest 测试套件用于验证 ArchSpine 系统中的运行时兼容性矩阵和配置模式版本解析。它确保配置模式的演进保持向后兼容，并能被运行时正确处理。

## 主要职责

- **隔离测试执行**：为每个测试场景创建和清理临时目录，确保测试状态不相互污染。
- **版本分类测试**：测试配置版本在当前、遗留、格式错误和不支持的模式输入下的分类情况。
- **`resolveSpineConfig` 验证**：断言配置有效性、迁移状态和问题报告的行为。
- **集成测试**：验证配置解析与索引文档读取子系统之间的集成。

## 不涉及范围

- 配置解析的生产运行时逻辑。
- 用户界面或命令行交互。
- 超出本地文件系统模拟的持久化或网络操作。

## 不变约束

- 必须是 Vitest 测试文件（`.test.ts` 后缀）。
- 必须使用临时目录隔离测试状态，并在每个测试后清理。
- 必须导入并测试 `resolveSpineConfig` 和 `readIndexDocument` 的公共 API。

## 公开接口

- `resolveSpineConfig`
- `readIndexDocument`
- `CURRENT_CONFIG_SCHEMA_VERSION`
- `CURRENT_SCHEMA_VERSION`

## 变更意图

架构意图是确保配置模式演进的向后兼容性，并能被运行时正确处理。最近的变更加强了模式处理，并添加了预览尝试功能。