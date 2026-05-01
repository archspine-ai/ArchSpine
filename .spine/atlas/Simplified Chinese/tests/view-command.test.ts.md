<!-- spine-content-hash:80034e453f2b496de73c16c5bd005ce55ca7f517a52ae4b7fd91bd27410f5b4c -->
# ArchSpine 视图命令测试套件

## 角色
这是一个用于 **视图命令** CLI 功能的 Vitest 单元测试套件。

## 主要职责
- 创建临时测试目录以隔离视图命令测试环境。
- 模拟 `console.log` 以捕获并验证 CLI 命令输出。
- 通过 `Config.setExperimentalViewLayer` 验证实验性视图层配置。
- 测试 `executeViewCommand` 函数在不同配置状态下的行为。

## 重要不变性
- 使用 Vitest 的 `describe`/`it`/`beforeEach`/`afterEach` 结构。
- 所有测试状态通过 `os.tmpdir` 下的临时目录隔离。
- 控制台输出被模拟以断言命令行为。
- 依赖 `Config` 基础设施来切换实验性功能。

## 负面范围（不涉及）
- **不**测试其他 CLI 命令（如 `scan`、`init`）。
- **不**实现视图命令本身的逻辑。
- **不**提供生产运行时服务。

## 导出/外部可见行为
- 无公开接口导出；此模块仅用于测试。
- 该套件验证视图命令能正确响应配置变化并输出适当的日志。