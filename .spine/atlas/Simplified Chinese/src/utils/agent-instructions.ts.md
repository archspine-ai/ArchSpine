<!-- spine-content-hash:8d14ac35f76ec2611240e96b799caf7921603ce2b9ff7bf62a7d70b5c9619a4b -->
# `agent-instructions/index.ts` — 桶导出模块

## 角色
该文件是一个 TypeScript 桶导出模块，为智能体指令工具提供统一的公共 API。它是使用者导入智能体指令功能的唯一入口点。

## 主要职责
- 重新导出 `./agent-instructions.templates.js` 中的所有公共成员
- 重新导出 `./agent-instructions.sync.js` 中的所有公共成员
- 为所有智能体指令工具提供单一、稳定的导入路径

## 重要不变性与否定范围
- **只能包含导出语句** — 不包含可执行代码、导入语句或运行时逻辑
- **不实现**任何智能体指令逻辑
- **不提供**配置或运行时行为

## 公开接口
底层两个模块导出的所有符号均在此重新导出：
- `./agent-instructions.templates.js` 中的所有内容
- `./agent-instructions.sync.js` 中的所有内容

该桶文件在底层同步辅助工具被重构和拆分后，作为稳定的公共接口，确保智能体指令工具模块的干净导入和正确封装。