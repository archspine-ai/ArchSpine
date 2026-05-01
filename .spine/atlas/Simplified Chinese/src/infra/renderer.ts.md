<!-- spine-content-hash:3ef7fd12c2311bb5f2e61ed32be25c94a7d18cfad9409d2ce4e1f44509219192 -->
# ArchSpine 文档渲染器

## 角色
ArchSpine 系统中的基础设施工具类和辅助函数，用于根据布局类型生成结构化的 Markdown 文档。

## 主要职责
- 定义 `LayoutType` 联合类型（`'source'`、`'document'`、`'config'`、`'folder'`、`'project'`），用于对文档内容进行分类。
- 提供 `DocumentationRenderer` 类及其静态 `render` 方法，将结构化数据转换为格式化的 Markdown 文档。
- 导出 `renderStructureList` 函数，将字符串数组连接为换行符分隔的列表。
- 导出 `renderExtraSections` 函数，通过过滤和拼接逻辑合并多个 Markdown 章节。
- 处理文本转义、空白符规范化以及列表/章节的组装，确保文档输出的一致性。

## 重要不变性与负面范围
- **不变性：** 必须保持为稳定的底层基础设施外观，不吸收编排或服务关注点（依据规则 `infra-facade-imports`）。
- **不变性：** 调用者应优先使用公共 API 表面（`DocumentationRenderer`、`renderStructureList`、`renderExtraSections`），而非深层内部实现路径。
- **负面范围：** 不直接处理文件 I/O 或文件系统操作（仅在 `render` 方法中依赖 `fs/path` 进行路径解析）。
- **负面范围：** 不实现任何业务逻辑或领域特定的内容生成。
- **负面范围：** 不管理图形渲染或 Mermaid 图表生成（`MermaidGraphConfig` 接口已定义但未导出或用于公共 API）。

## 最重要的导出/外部可见行为
- `LayoutType`（类型导出）
- `DocumentationRenderer`（类导出，包含静态 `render` 方法）
- `renderStructureList`（函数导出）
- `renderExtraSections`（函数导出）