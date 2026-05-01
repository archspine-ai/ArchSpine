<!-- spine-content-hash:18475d0c4bd6012273632c62a681623e7a0eeec8587ee725290bfae40cfd8a3d -->
# ArchSpine – 规则加载测试套件

## 角色
验证规则加载子系统的 Vitest 单元测试套件。

## 主要职责
- 验证 `loadRulesFromDir` 能否正确将 YAML 规则模板解析为标准化规则文档。
- 确保规则属性（`ruleId`、`appliesTo`、`severity`、`summary`）被正确提取并与预期值匹配。
- 通过临时目录测试规则加载，以隔离文件系统依赖。
- 验证规则加载能否正确处理相对于当前工作目录的路径。

## 重要不变项与负面范围
- 使用 Vitest 测试框架，采用 `describe`/`it`/`expect` 断言方式。
- 使用临时目录隔离文件系统操作。
- 依赖 `../src/infra/rules-loader.js` 中的 `loadRulesFromDir` 函数。
- **不涉及范围：** 测试 CLI 或扫描器等其他子系统；生产环境规则执行或运行时验证；UI 或 API 端点。

## 最重要的外部可见行为
该测试套件专注于核心规则加载功能，确保架构规则定义被正确解析，并且加载过程对文件系统依赖具有鲁棒性。