<!-- spine-content-hash:0bbe6a2a1bab776da14434fc1739455bfed5e390b7b035d0a8e875e543fb14f2 -->
# `getGlobalArchSpineDir` 的单元测试套件

本 Vitest 测试套件验证特定平台下全局 ArchSpine 目录路径的解析功能。

## 职责
- 测试非 Windows 平台（如 Linux/macOS）上通过 `ARCHSPINE_DIR` 环境变量覆盖时的行为。
- 测试 Windows 平台上的环境变量覆盖行为。
- 测试未设置环境变量时非 Windows 平台上的默认回退路径（使用 `path.join(os.homedir(), '.archspine')`）。
- 每个测试后通过 `afterEach` 恢复 `process.platform` 和 `process.env`，防止测试间污染。
- 间接验证 LLM 基础设施模块中全局目录解析的内部逻辑。

## 排除范围
- 集成测试或端到端测试。
- 测试超出 `getGlobalArchSpineDir` 的其他函数或模块。
- 性能测试或压力测试。

## 不变条件
- 每个测试用例后必须恢复 `process.platform` 和 `process.env` 的原始值。

## 对外接口
- 被测试的导出函数：`getGlobalArchSpineDir`
- 测试框架工具：`describe`、`afterEach`、`it`、`expect`

## 变更意图
- 架构意图：验证全局目录解析在不同平台和环境变量配置下的正确性。
- 最近变更：添加了 Windows 平台测试，覆盖修复 CHK-02 / FIX-02，对应提交信息“test: add Windows platform tests, CHK-02, FIX-02, and real LLM E2E tests”。