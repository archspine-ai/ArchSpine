<!-- spine-content-hash:c6248d699a7f3fe2b89203d82d765b7eeb66392f4f0d93085b74895781b0e03f -->
# ArchSpine 预提交钩子块生成器

## 角色
基础设施工具模块，用于生成和管理 ArchSpine 预提交 Git 钩子的 shell 脚本块。

## 主要职责
- 定义 `InstallGitHookResult` 联合类型，表示 Git 钩子安装操作的结果。
- 实现 `getManagedHookBlock()` 函数，生成 ArchSpine 预提交钩子的标准化 shell 脚本块，包括定位 `spine` CLI 命令的逻辑。

## 重要不变性
- 生成的钩子块必须始终包含 ArchSpine 标记注释（`# >>> ArchSpine pre-commit >>>` 和 `# <<< ArchSpine pre-commit <<<`）。
- 钩子块必须首先尝试使用 `./node_modules/.bin/spine`，然后回退到全局安装的 `spine`，最后回退到 `dist/cli/index.js`。

## 排除范围（不在职责内）
- 实际在 `.git/hooks` 目录中安装、更新或删除钩子文件。
- 验证 Git 仓库根目录或执行超出生成钩子脚本内容的文件系统操作。

## 最重要的导出行为
- **`InstallGitHookResult`**（类型导出）：表示钩子安装可能结果的联合类型。
- **`getManagedHookBlock`**（函数导出）：生成 ArchSpine 预提交钩子的完整 shell 脚本块，包含定位 `spine` CLI 的回退逻辑。