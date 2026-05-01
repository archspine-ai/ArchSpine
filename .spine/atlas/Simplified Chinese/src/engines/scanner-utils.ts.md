<!-- spine-content-hash:c71b9afe66b27ee29f18692e09e7d8cd8bc9020ca9e6f4a45c6f6fb00afe3ced -->
# ArchSpine – 扫描工具模块

## 角色
扫描引擎工具模块，提供文件路径和模式的规范化功能，用于文件扫描操作。

## 主要职责
- 将文件路径规范化为 Unix 风格斜杠，并去除开头的 `./` 前缀。
- 规范化扫描模式，确保目录模式扩展为包含 `**` 的形式。
- 定义 `NotableExclusion` 接口，用于跟踪带有元数据的排除模式。

## 不包含范围
- 文件系统遍历或目录行走逻辑。
- 模式匹配执行或 glob 评估。
- 扫描结果聚合或报告生成。

## 不变约束
- 必须保持无 CLI 入口点导入，以满足引擎独立性规则。
- 不得导入服务级编排模块。

## 公开接口
- `normalizeScannerPath(file: string): string`
- `normalizeScannerPattern(pattern: string): string`
- `NotableExclusion` 接口

## 变更意图
**架构意图：** 为扫描引擎提供可复用的路径和模式规范化工具，确保跨扫描操作的文件路径和 glob 模式处理一致性。  
**近期变更：** 未检测到近期变更；该模块作为 v1.0 前管道修复的一部分保持稳定。