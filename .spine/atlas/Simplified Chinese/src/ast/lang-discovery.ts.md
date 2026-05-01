<!-- spine-content-hash:42899fcd73195186868a9f96320a91fd8554531fd2cf54edab760a0ada83aa1b -->
# ArchSpine 语言发现模块

## 角色
AST 语言发现与生命周期模块，负责扫描文件集合、通过扩展名映射解析编程语言、计算快照之间的差异，并验证语言支持。

## 主要职责
- 扫描文件路径集合，识别唯一的文件扩展名，并使用 LangRegistry 将其解析为编程语言。
- 提供 `resolveLanguage` 函数，用于确定单个文件路径对应的语言。
- 计算当前与之前语言快照之间的 LanguageDelta，跟踪新增、移除和变更的语言。
- 通过检查检测到的扩展名是否已在 LangRegistry 中注册，验证语言支持情况，并报告不支持的语言。

## 重要不变性与范围限制
- 所有检测到的扩展名在处理前均转换为小写。
- 语言快照包含已排序的检测到的扩展名数组。
- **不涉及范围：** 文件系统遍历或目录行走（仅操作提供的文件路径）。语言配置或注册（委托给 LangRegistry）。语言快照的持久化存储。

## 公开接口（外部可见行为）
- `discoverLanguages(files: string[]): Promise<LanguageSnapshot>` — 扫描文件路径并返回检测到的语言快照。
- `diffLanguages(prev: LanguageSnapshot, curr: LanguageSnapshot): LanguageDelta` — 计算两个语言快照之间的差异。
- `resolveLanguage(filePath: string): Promise<...>` — 解析单个文件路径对应的编程语言。