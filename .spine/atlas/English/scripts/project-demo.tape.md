---MARKDOWN:Simplified Chinese---
# ArchSpine CLI 演示录制脚本

## 目的
本文档是一个 VHS 磁带脚本，用于自动生成 ArchSpine CLI 的演示 GIF。它引导用户完成项目的构建，并执行三个关键命令（`sync`、`info`、`scan`），以在终端环境中展示基本功能。

## 目标读者
想要快速了解 ArchSpine 命令行界面的开发者、贡献者或评估者。该演示旨在纳入项目的公共文档或 README 中。

## 关键决策与工作流程
该脚本锚定了以下决策与工作流程：
- **终端设置**：使用 `zsh`  shell、Catppuccin Mocha 主题、1280x720 分辨率、18 号字体以及 45ms 的打字速度。
- **构建步骤**：先执行 `npm run build` 编译项目，然后再运行 CLI 命令。
- **演示的命令**：
  1. `sync --fast`
  2. `info`
  3. `scan --dry-run`
- **输出文件**：生成的 GIF 保存在 `docs/public/archspine-project-demo.gif`。

该脚本提供了一种可复现、自动化的方式，为项目创建一致的视觉演示。