<!-- spine-content-hash:f21ed5085f1408cba3c931df3a4c20d230a9fda03b4cbf29afc70ffea6da79bf -->
# ArchitectureDiagramRenderer 测试套件

## 角色
ArchitectureDiagramRenderer 组件的 Vitest 单元测试套件。

## 主要职责
- 验证 ArchitectureDiagramRenderer 生成的 SVG 输出包含预期的节点标签和结构。
- 测试空节点列表和自定义样式覆盖等边界情况。
- 确保渲染器正确处理 ArchDiagramSpec 输入并生成确定性的 SVG。

## 重要不变规则
- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：test-file-suffix）。

## 排除范围（不涉及）
- 与实际 DOM 或浏览器环境的集成测试。
- SVG 生成的性能基准测试。
- 其他渲染器或图表类型的测试。

## 最重要的导出/外部可见行为
- `describe('ArchitectureDiagramRenderer')` — 测试套件入口。
- `it('renders all node labels and structure')` — 验证完整图表输出。
- `it('handles empty node list')` — 验证对空输入的正确处理。