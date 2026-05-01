<!-- spine-content-hash:d7775eb9c6f8a1f8e32bb409319bd609d045204e3b100d76ef3b588d48340d32 -->
# ArchSpine – 实验性视图层配置解析集成测试

## 角色
用于实验性视图层配置解析的 Vitest 集成测试套件。

## 主要职责
- 验证 `resolveExperimentalViewLayer` 函数在不同配置场景下的行为。
- 测试环境变量 `SPINE_EXPERIMENTAL_VIEW_LAYER` 的覆盖机制。
- 验证 `Config.setExperimentalViewLayer` 的持久性及其对解析结果的影响。
- 确保临时测试目录被正确创建和清理。

## 重要不变性与负面范围
- **不变性：** 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：test-file-suffix）。
- **不涉及范围：**
  - 对单个视图层组件的单元测试。
  - 视图派生或提交后派生逻辑的测试。
  - 视图层解析的性能或压力测试。

## 最重要的导出或外部可见行为
本套件不导出任何公共 API 接口；它纯粹是一个测试工具。其最主要的外部可见行为是验证配置解析是否同时尊重程序化覆盖和环境变量覆盖，并确保临时测试目录得到妥善管理。