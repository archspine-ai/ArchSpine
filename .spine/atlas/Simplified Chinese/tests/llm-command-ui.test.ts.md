<!-- spine-content-hash:af4ffc10c0d2c4a20e565ad1a20e91b980401bcef0f12cc7ab2860964abaf3bd -->
# ArchSpine 源码摘要：LLM 命令用户界面测试套件

## 角色
这是一个 Vitest 单元测试套件，用于验证 ArchSpine 镜像系统中 LLM 命令的用户界面和配置表面。

## 主要职责
- 确保 LLM 命令在执行 `set` 操作时正确拒绝内部兼容性键。
- 验证 `llm status` 命令能够按预期将提供商和模型信息打印到控制台。

## 重要不变项与排除范围
- **不变项：** 测试文件必须使用 `.test.ts` 或 `.spec.ts` 后缀，以符合 `test-file-suffix` 规则。
- **排除范围：** 本套件不涵盖 LLM 命令的集成或端到端测试，也不测试 LLM API 调用执行、响应处理或配置持久化/存储层。

## 最重要的导出行为
该套件暴露了两个主要测试用例：
- `describe('LLM command UI surface', ...)` — 对 UI 相关测试进行分组。
- `it('rejects internal compatibility keys from llm set usage', ...)` — 验证对无效键的拒绝。
- `it('prints provider and model info from llm status', ...)` — 确认状态输出正确。

此测试套件为 LLM 命令的 CLI 表面提供了自动化回归覆盖，确保配置验证和状态显示功能正常运行。