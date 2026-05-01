<!-- spine-content-hash:241b223bf4b8461af6e2185946f4193a93657ae7315395b3d35e59ca53b50816 -->
# OutputManager – pruneAtlasLocales 单元测试

## 角色
OutputManager 类的单元测试套件，专门测试 `pruneAtlasLocales` 方法。

## 主要职责
- 创建临时目录，其中包含 `.spine/atlas` 结构以及语言子目录（English、Simplified Chinese）和示例文件。
- 使用临时目录路径实例化 OutputManager。
- 调用 `OutputManager.pruneAtlasLocales` 方法，传入仅包含 `'Simplified Chinese'` 的集合，以测试语言区域清理逻辑。
- 断言 `'English'` 语言目录在清理后被删除。
- 断言 `'Simplified Chinese'` 语言目录在清理后仍然保留。
- 通过 `afterEach` 钩子在每个测试后清理临时目录。

## 重要不变项与负面范围
- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。
- **不**涵盖超出临时目录范围的集成测试。
- **不**包含 OutputManager 的性能或压力测试。
- **不**测试 OutputManager 的其他方法（如 `write`、`read`）。
- **不**包含端到端或系统级测试。

## 最重要的导出/外部可见行为
- `describe('output manager', ...)` – 测试套件声明。
- `afterEach(() => { ... })` – 清理钩子。
- `it('should prune atlas locales', ...)` – 核心测试用例，验证语言区域清理逻辑。