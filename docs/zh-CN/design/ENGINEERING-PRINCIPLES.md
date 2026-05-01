# Engineering Principles 与技术加固

ArchSpine 以工业级韧性为目标构建，确保即使在大型、频繁变动的开发环境中，架构治理也能保持一致。本文档总结当前 `v1.0.x` 线路已经落地的核心工程原则。

## 1. 原子化增量检测（Hash Bypass）

为了让 Git Hook 保持亚秒级响应，ArchSpine 为文件变更检测实现了 Fast Path。

- **机制**：系统把每个 tracked 文件的 `mtime` 和 `size` 存入本地 SQLite `cache.db`
- **优化**：在哈希阶段先做浅层元数据比对；如果磁盘元数据与数据库记录一致，则跳过昂贵的 SHA-256 计算，直接返回缓存哈希
- **可靠性**：这条路径不依赖 Git 状态，因此即使开发者绕过 hook 或手动修改文件，也能发现变化

## 2. 图谱自愈（Resilience）

架构依赖图是 ArchSpine 语义推理的基础，因此其一致性必须优先保证。

- **状态持久化**：Reverse Index 的完成状态持久化在 `.spine/manifest.json`
- **自动恢复**：如果同步中断，`ReverseIndexComplete` 会保持 `false`；下次运行时会强制重建整张图，而不是只做增量更新
- **一致性**：这样可以避免“文件摘要已经变了，但依赖图还停留在旧状态”的语义分叉

## 3. 内存安全索引（Streaming）

处理 10,000+ 文件的仓库时，必须避免 Node.js OOM。

- **选择性缓存**：在图构建过程中，只加载 index JSON 中的 `identity` 和 `graph`，跳过大型摘要和 token 数组
- **原子重写**：只有在确实需要写某个节点时，才重新从磁盘加载完整 `SpineUnit`
- **可扩展性**：这样可以把峰值内存压在可控范围内

## 4. 根级扫描剪枝（Performance）

在 `node_modules`、`dist` 很深的仓库里，文件系统扫描本身就可能成为瓶颈。

- **递归剪枝**：`Scanner.walkFileSystem` 在进入子目录前先查询 `ScanPolicy` 和 ignore 规则
- **短路**：如果目录在根层就被忽略，例如 `node_modules/`，则整棵分支会被直接剪掉，避免大量无效 `stat` 调用

## 5. 工业级并发

ArchSpine 在完整或增量同步时采用分层并行模型，以提高吞吐量。

- **按深度并行聚合**：同一层级的目录可以并行聚合，再逐层向根目录冒泡
- **指数退避**：所有 LLM 调用都包裹在带抖动的指数退避重试逻辑里，用于处理 socket reset、DNS 问题和 429 限流
