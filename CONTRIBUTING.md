# ArchSpine 贡献指南 (Contributing Guide)

感谢你对 ArchSpine 的关注！我们欢迎任何形式的贡献，包括修复 Bug、完善文档、提出新功能建议或提交代码。

开始之前，请一并阅读：

- [SUPPORT.md](./SUPPORT.md)：确认问题该走使用支持、文档反馈还是功能请求
- [SECURITY.md](./SECURITY.md)：安全问题不要走公开 issue
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)：公开协作行为约定

## 🛠️ 开发环境搭建

1.  **克隆仓库**：
    ```bash
    git clone https://github.com/archspine-ai/archspine.git
    cd archSpine
    ```
2.  **安装依赖**：
    ```bash
    npm install
    ```
3.  **构建项目**：
    ```bash
    npm run build
    ```
4.  **运行测试**：
    ```bash
    npm run test
    ```

## 📜 提交规范 (Commit Convention)

我们遵循简洁明了的提交规范：

- `feat`: 新功能
- `fix`: 修补 Bug
- `docs`: 文档修改
- `style`: 代码格式修改 (不影响代码运行的变动)
- `refactor`: 重构 (既不是新增功能，也不是修改 Bug 的代码变动)
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动

示例：`feat(cli): 增加 spine init 的交互式引导`

## 🤝 贡献流程

1.  Fork 本仓库。
2.  创建你的特性分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交你的改动 (`git commit -m 'feat: Add some AmazingFeature'`)。
4.  将分支推送到远程仓库 (`git push origin feature/AmazingFeature`)。
5.  在 GitHub 上发起 Pull Request。

如果你准备提交公开 issue，请先确认不包含凭据、内部仓库路径、客户代码片段或其他敏感信息。

## 📚 文档双语维护规则

如果你的改动涉及 `docs/`、`README.md` 或 `README.en.md`，请同时检查以下规则：

1. 先判断文档类型  
   新文档必须先归类为：
   - 公开用户文档
   - 内部工作文档

2. 内部文档不要进入公开入口  
   `docs/design/**`、`docs/planning/**`、`docs/logs/**`、`docs/archive/**`、`docs/validation_plan.md` 默认视为内部文档，不应加入首页、README 主入口或 VitePress 主导航。

3. 核心公开路径必须有双语入口  
   如果新增的是用户第一次会走到的页面，例如首页、快速开始、demo、MCP 接入、showcase、文档总入口，则必须同时提供中英文入口，或在 PR 中明确说明为什么暂时单语。

4. 规格文档按当前双语结构维护  
   英文 specs 放在 `docs/specs/`，中文镜像放在 `docs/zh-CN/specs/`。旧的 `docs/specs/zh-CN/` 只保留历史资料，不再作为新的镜像主目录。

5. 修改公开文档时，检查另一语言是否需要同步  
   不要求每次逐句翻译，但必须判断另一语言入口是否会因此失真、断链或产生错误承诺。

6. 新增公开文档后，要同步三处
   - `docs/README.md` 的映射表
   - `docs/.vitepress/config.ts` 的公开导航
   - 对应语言的 `README` 文档入口

7. 英文识别规则只用于盘点  
   当前约定是“前五行没有中文”可视为英文优先页。这个规则只用于 inventory，不代表页面天然就是公开主入口。

## ⚖️ 开源协议

通过提交代码，你同意你的贡献将遵循 [Apache-2.0](./LICENSE) 协议。
