# 锁工作进程脚本摘要

## 目的
该文档是一个锁工作进程脚本，用于测试 ArchSpine 项目中的并发控制机制。

## 上下文和受众
此脚本面向编写或维护基于文件的锁定相关测试的开发人员。它作为子进程由测试套件（如 lock-worker.mjs）运行。读者应熟悉 Node.js 子进程和 LockManager 接口。脚本支持三种模式：acquire-release（默认）、acquire-hold 和 acquire-release-rewrite（不释放锁）。

## 关键要点
- 工作进程支持三种模式：acquire-release（默认）、acquire-hold 和 acquire-release-rewrite（不释放锁）。
- 使用 ts-node/esm 直接运行 TypeScript，并从 src/utils/lock.ts 导入 LockManager。
- 输出为标准输出的 JSON，便于测试断言解析。
- 信号处理确保即使在长时间持有锁时也能干净退出。