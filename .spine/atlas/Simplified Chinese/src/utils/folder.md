## 工具模块目录

`utilities` 目录包含了 ArchSpine 所有共享的基础设施模块：文件同步、加密指纹生成、CLI 界面展示以及运行时互斥锁。这些模块设计为独立、可测试且可在系统不同部分复用的组件。

### 主要子模块及分组

- **Agent 指令管理**（`agent-instructions.sync.ts`、`agent-instructions.templates.ts`、`agent-instructions.ts`）  
  负责 ArchSpine 在仓库文件中管理的代码块完整生命周期：插入、更新和移除特定标记区域（如 `.gitignore`、`.gitattributes`、`AGENTS.md`、搜索忽略文件、spine 忽略文件以及 `package.json` 脚本）。模板文件提供静态标记常量和默认内容，同步文件实现所有修改逻辑，桶文件重新导出统一公共 API。

- **指纹生成**（`footprint.ts`）  
  生成架构骨架（`FileSkeleton`）和语义合约（`SpineSemantic`）的确定性 SHA-256 指纹。支持短路变更检测，无需完整内容比较。内部对导入/导出符号进行规范化和去重，确保哈希值稳定。

- **安全文件 I/O**（`fs.ts`）  
  提供原子写入（临时文件+重命名模式）和安全复制操作，自动创建目录。所有操作具备防损坏能力，并通过 `FileSystemManager` 支持回滚。

- **Git 钩子生命周期**（`git-hook.ts`）  
  管理 ArchSpine 预提交钩子的安装、更新和移除。生成可定位 spine CLI 的受管理 shell 块，优雅处理已有钩子（附加或替换），设置可执行权限，并返回类型化结果（`installed`、`updated`、`appended` 等）。

- **文件锁**（`lock.ts`）  
  基于文件的互斥实现，使用 `.spine/` 目录下的锁文件。采用 `crypto.randomUUID` 生成令牌，通过检查进程存活状态检测过期锁，并注册进程终止信号的清理处理器。

- **路径规范化**（`repo-path.ts`）  
  将原始文件系统路径转换为仓库相对路径（POSIX 风格），去除 `./` 和 `/` 前缀，转换 Windows 反斜杠。确保数据库键表示一致。

- **CLI 界面**（`banner.ts`、`confirm.ts`）  
  `banner.ts` 使用 chalk 主题渲染带版本信息的 ASCII 艺术横幅。`confirm.ts` 提供交互式确认提示，支持显式文本输入和单键输入模式，并正确管理终端状态。

### 关键实现领域

- **同步正确性**：agent 指令同步模块需处理每个文件中的多个受管理代码块，检测过时块，并在移除受管理部分时恢复原始内容。
- **确定性指纹生成**：`footprint` 模块对导入/导出符号的规范化对于可靠变更检测至关重要；任何排序不稳定都会导致误报。
- **原子性与安全性**：`fs.ts` 和 `git-hook.ts` 均依赖安全写入模式和备份/回滚机制，防止并发操作期间的损坏。
- **锁的健壮性**：锁模块必须优雅处理进程崩溃，防止永久锁文件阻塞后续运行。
- **跨平台路径处理**：`repo-path.ts` 确保 Windows 和 POSIX 系统的路径被统一规范化，便于数据库查找。