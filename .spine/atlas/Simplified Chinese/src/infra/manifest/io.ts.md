<!-- spine-content-hash:ef37cd8cc48677161f0a998f17ea94529cb2004e41a69f4750d5d591de796d36 -->
# ArchSpine 文件工具模块

## 角色
基础设施工具模块，为 ArchSpine 的清单和语言快照系统提供文件路径解析、JSON 文件读取以及文件状态快照功能。

## 主要职责
- 在给定的根目录下构建 spine 清单文件（`.spine/manifest.json`）和语言快照文件（`.spine/languages.json`）的绝对路径。
- 从文件系统读取并解析 JSON 文件，对缺失文件提供空安全处理，并使用 `defaultRuntimeIO` 输出警告信息。
- 通过 `fs.statSync` 提供文件状态快照功能（`mtimeMs`、`size`），用于监控文件变更。

## 重要不变性
- 清单和语言快照路径始终相对于提供的 `rootDir`，位于 `.spine` 子目录下。
- `readJsonFile` 在文件不存在时返回 `null`，绝不会因文件缺失而抛出异常。
- 文件状态快照使用 `fs.statSync` 同步计算。

## 不涉及范围
- 不处理超出 JSON 反序列化之外的清单或语言内容的模式验证或解析。
- 不管理文件的写入、删除或目录创建。
- 不实现文件读取的缓存或记忆化。

## 公开接口
- `getManifestPath(rootDir: string): string`
- `getLanguageSnapshotPath(rootDir: string): string`
- `readJsonFile<T>(filePath: string): T | null`