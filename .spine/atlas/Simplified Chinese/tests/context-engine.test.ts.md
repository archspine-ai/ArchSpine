<!-- spine-content-hash:08129d507b8038d3bce1407a343b9a7ba6fbc6092d9438d3b195c317e7bba1f9 -->
# ContextEngine 测试套件

本 Vitest 单元测试套件用于验证 ContextEngine 轻量级相关性排序算法和依赖解析。

## 职责

- 创建临时测试目录和文件，模拟项目结构以实现隔离测试。
- 测试 ContextEngine 的依赖解析和相关性评分逻辑。
- 在每个测试后清理临时资源，防止副作用。

## 不涉及范围

- 与真实文件系统或外部服务的集成测试。
- ContextEngine 的性能或负载测试。
- ArchSpine 系统中其他引擎或组件的测试。

## 不变规则

- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾（规则：test-file-suffix）。

## 架构意图

提供针对 ContextEngine 核心功能的专注测试套件，确保在隔离环境中依赖解析和相关性排序的正确性。

## 最近变更

此文件未检测到最近变更；提交 'feat: tighten schema handling and add try preview' 不直接影响此测试套件。

## 公开接口

无。

## 漂移检测

未检测到漂移。