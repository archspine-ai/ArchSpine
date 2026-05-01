<!-- spine-content-hash:d67801102ffba4916d8c809eb82cc1b41133953c23ed378f45fc08e5170b38cc -->
# ArchSpine 修复策略模块

## 角色
该 TypeScript 模块定义了 ArchSpine 同步系统中处理违规的修复策略决策逻辑。它决定在检测到同步违规时应采用哪种修复策略。

## 主要职责
- 定义 `RepairPolicyAction` 联合类型，指定可能的修复策略：`targeted-repair`（定向修复）、`prompt-full-rebuild`（提示完全重建）和 `require-full-rebuild`（要求完全重建）。
- 定义 `RepairPolicyDecision` 接口，封装决策结果，包括违规计数和定向文件列表。
- 实现违规路径分类逻辑，并根据路径映射确定适当的修复操作。
- 处理违规报告中的已更改、已添加和已删除路径，以构建定向修复集。

## 重要不变性与范围外
- **不变性：** 该模块仅导出类型定义和纯决策逻辑。它依赖导入的违规报告类型作为输入结构，并在路径字符串上操作以产生无副作用的修复决策。
- **范围外：** 该模块不执行直接的文件系统 I/O 或网络操作、用户界面渲染或交互，也不涉及底层基础设施编排或服务管理。

## 公开接口
- `RepairPolicyAction`
- `RepairPolicyDecision`