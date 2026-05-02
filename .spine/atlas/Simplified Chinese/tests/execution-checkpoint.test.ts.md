<!-- spine-content-hash:9a4bc873c43050e7af1d250d00d48f912e082a0bad8534f6879c087fea46f03e -->
# resume-services 测试套件（ArchSpine）

**角色：** 用于验证执行检查点恢复候选派生逻辑的 Vitest 测试套件，涵盖同步和检查操作。

**主要职责：**
- 测试 deriveSyncResumeCandidateFiles 函数在同步操作期间生成正确的文件候选。
- 测试 deriveCheckResumeCandidateFiles 函数在检查操作期间的检查点恢复逻辑。
- 验证 ExecutionCheckpointStore 状态处理和模式合规性。
- 确保恢复候选派生能够正确处理不同的命令状态和运行标识符。

**注意事项与排除范围：**
- 排除范围：超出临时目录范围的实际文件系统操作集成测试；恢复候选派生的性能或负载测试；与恢复候选派生无关的其他执行检查点存储方法的测试。
- 不变规则：测试文件必须以 .test.ts 或 .spec.ts 结尾（规则：test-file-suffix）。

**最重要的导出/外部可见行为：**
- `describe('resume-services')`
- `it('deriveSyncResumeCandidateFiles')`
- `it('deriveCheckResumeCandidateFiles')`