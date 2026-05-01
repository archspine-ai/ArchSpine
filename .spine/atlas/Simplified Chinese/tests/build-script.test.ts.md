<!-- spine-content-hash:08a415a956699e22fb32dcd834b8bc5e79dbdfed9b17753cd31b60cfefba8815 -->
# 构建脚本分发包过滤测试

## 角色
构建脚本分发打包过滤函数的单元测试套件。

## 主要职责
- 验证 `shouldExcludeDistEntry` 能正确识别 `__mocks__` 路径为应从分发包中排除的条目。
- 验证非模拟路径（例如 `src/infra/llm/runtime.ts`）不会被从分发包中排除。

## 不涉及范围
- 构建管道的集成或端到端测试。
- 测试构建脚本中除 `shouldExcludeDistEntry` 之外的其他函数。
- 测试构建脚本的文件系统操作或命令行行为。

## 不变约束
- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾。

## 架构意图
确保构建脚本的分发打包过滤器能正确排除模拟目录，防止测试基础设施泄露到生产构件中。

## 近期变更意图
开源发布初始提交（v1.0.0）——该测试验证了核心打包行为。

## 公开接口
- `describe('build script packaging filters', ...)`
- `it('excludes __mocks__ content from dist packaging', ...)`