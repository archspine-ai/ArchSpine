<!-- spine-content-hash:1d7791df0810ee432819291c04933a0b0b2ef673dacd9536ba5668178aa4a7b9 -->
# ArchSpine – ArchitectureDiagramRenderer

**角色：** 纯渲染工具，将架构图规格转换为 SVG 标记。

**主要职责：**
- 为每种架构节点类型（前端、后端、数据库等）定义视觉样式（填充、描边）。
- 按照预定义顺序排列节点层，确保布局一致。
- 通过静态 `render` 方法将 `ArchDiagramSpec` 转换为完整的 SVG 字符串表示。
- 计算 SVG 画布内的节点位置，避免重叠并保持层间分离。
- 对节点标签中的 HTML 实体进行转义，确保 SVG 文本内容安全。

**重要不变性与负面范围：**
- 纯函数，无副作用；输出仅取决于输入规格。
- 给定相同规格，SVG 生成是确定性的。
- 节点定位算法确保同一层内无重叠。
- **不涉及：** 编排运行时服务或业务逻辑、处理用户交互或动态更新、持久化图表数据或管理应用状态、提供交互式图表编辑功能。

**最重要的导出行为：**
- `ArchitectureDiagramRenderer.render(spec: ArchDiagramSpec): string` – 唯一的公共入口点，根据图表规格生成 SVG 字符串。