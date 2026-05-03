本目录实现了 ArchSpine 镜像系统的基础设施层，专注于清单持久化、文件完整性校验与状态管理。模块按以下五个关键领域组织：

- **数据类型** (`types.ts`) – 定义 `FileSnapshot` 接口，为文件元数据（修改时间和大小）提供在整个系统中使用的一致合约。
- **文件 I/O** (`io.ts`) – 处理 `.spine/manifest.json` 和 `.spine/languages.json` 的确定性路径解析、带空安全的 JSON 读取以及通过 `fs.statSync` 获取文件系统快照。
- **完整性校验** (`integrity.ts`) – 结合文件系统验证计算 SHA-256 哈希，并从 SpineDB 检索当前文件状态，针对缺失或非常规文件抛出描述性错误。
- **状态管理** (`state.ts`) – 提供清单运行时状态（包括反向索引跟踪）的持久化、基线检测以及语言快照的读写。定义了 `ManifestRuntimeState` 与 `ManifestStatusSource` 接口。
- **外观层** (`facade.ts`) – 将 SpineDB 操作封装为统一接口，用于清单状态持久化、文件状态追踪、偏移历史管理以及批量提交。

最关键的实施领域包括清单基线检测与首次同步判断（`state.ts`）、带文件系统验证的 SHA‑256 哈希计算（`integrity.ts`），以及外观层对各子模块的集成，以支持同步和验证工作流。