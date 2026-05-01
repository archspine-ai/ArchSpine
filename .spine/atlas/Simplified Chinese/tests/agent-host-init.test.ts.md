<!-- spine-content-hash:c2bc2448444604be4815efe5d08beb3469fd2e748c2f1f92226f2eea6a75a768 -->
# ArchSpine 仓库引导与托管文件同步 — 测试套件

## 角色
ArchSpine 仓库引导和托管文件同步系统的 Vitest 单元测试套件。

## 主要职责
- 测试通过 `sync*` 函数同步托管仓库文件（agent instructions、gitattributes、gitignore、search ignore、spine ignore）的功能。
- 验证在 agent instructions 文件中注入和移除 ArchSpine 脚本的操作。
- 验证清理过程中托管文件的移除操作。
- 使用 `runRepositoryBootstrap` 和 `Config` 实例测试完整的仓库引导工作流程。
- 使用临时目录（`os.tmpdir`、`fs.mkdtempSync`）隔离测试状态，防止副作用。
- 断言同步和清理操作后文件的正确内容、存在状态和缺失状态。

## 重要不变性与负面范围
- **不变性：** 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。
- **不涵盖：** 不测试无效配置的错误处理或边界情况。不涵盖与外部系统的集成或真实文件系统权限。不测试同步系统的性能或并发方面。

## 最重要的导出/外部可见行为
该套件验证托管文件被幂等地写入并正确移除，确保同步子系统在正常条件下行为正确。