# 共享工具模块 — `src/shared/utils/`

此目录提供ArchSpine CLI和核心操作共享的通用基础设施模块。这些工具共同支持文件同步、模板生成、终端交互、加密指纹计算、文件I/O安全性、Git钩子管理和系统级锁定等功能。

## 主要子模块及分组

各模块按功能分为以下几类：

- **Agent指令同步与模板** – `agent-instructions.sync.ts`、`agent-instructions.templates.ts`以及它们的桶导出`agent-instructions.ts`负责读取、写入和删除ArchSpine管理的代码块（适用于`.gitignore`、`.gitattributes`、`AGENTS.md`、`searchignore`、`.spineignore`以及`package.json`脚本），并提供标记分隔符和默认忽略规则的静态配置。
- **CLI展示** – `banner.ts`使用chalk主题渲染带版本信息的品牌ASCII艺术横幅。`confirm.ts`提供交互式确认提示（支持文本输入和单键按下两种模式），并通过kleur输出彩色文本。
- **加密指纹** – `footprint.ts`为`FileSkeleton`和`SpineSemantic`对象计算稳定的SHA-256哈希值，用于结构和语义变更检测。
- **安全文件I/O** – `fs.ts`实现原子写入（临时文件+重命名模式）以及带目录创建的副本操作。
- **Git钩子生命周期** – `git-hook.ts`管理pre-commit钩子的安装、更新和移除，委托给spine CLI执行，并在操作前进行安全备份。
- **互斥锁** – `lock.ts`在`.spine/`目录下提供基于文件的锁定机制，包含UUID令牌生成和过期锁检测功能。
- **路径标准化** – `repo-path.ts`将文件系统路径转换为相对于仓库的POSIX分隔符格式，确保数据库查找时主键一致。

## 关键实现领域

对系统正确性至关重要的模块包括：`agent-instructions.sync.ts`（所有受管代码块的中心I/O）、`footprint.ts`（驱动变更检测的确定性指纹）以及`lock.ts`（防止并发操作中的竞态条件）。Git钩子生命周期（`git-hook.ts`）对仓库集成必不可少，而`fs.ts`通过原子写入保障数据完整性。