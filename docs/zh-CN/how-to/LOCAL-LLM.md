# 本地 LLM 接入指南（Ollama / LM Studio）

ArchSpine 使用 OpenAI-Compatible HTTP 接口与 LLM 通信，因此可以直接接入 Ollama、LM Studio 这类本地推理框架，而不需要修改运行时代码。

> [!NOTE]
> 本地模型适合隐私敏感或离线场景。
> 默认先使用 `spine llm set mode standard`。如果显存或本地上下文仍然吃紧，再把 `prompt-tier lite` 作为高级兜底覆盖项。

## 方案一：Ollama

### 1. 安装并启动 Ollama

```bash
brew install ollama
ollama pull qwen2.5:14b
# 或
ollama pull llama3.3:70b
ollama serve
```

### 2. 配置 ArchSpine

```bash
spine llm set provider openai
spine llm set base-url http://localhost:11434/v1
spine llm set model qwen2.5:14b
spine llm set api-key ollama
spine llm set mode standard
```

### 3. 验证连接

```bash
curl http://localhost:11434/v1/models
spine build
```

## 方案二：LM Studio

### 1. 启动本地服务

1. 安装 [LM Studio](https://lmstudio.ai/)
2. 加载具备足够上下文的模型，例如 Qwen2.5-14B-Instruct 或 Llama 3.3 70B
3. 在 Local Server 页面启动服务，默认端口通常是 `1234`

### 2. 配置 ArchSpine

```bash
spine llm set provider openai
spine llm set base-url http://localhost:1234/v1
spine llm set model <LM Studio 中的模型标识>
spine llm set api-key lm-studio
spine llm set mode standard
```

## 模型建议

| 模型           | 参数规模 | 约需显存 | 128k 上下文 | 推荐场景           |
| -------------- | -------- | -------- | ----------- | ------------------ |
| `qwen2.5:14b`  | 14B      | ~10GB    | 是          | 日常开发性价比最高 |
| `qwen2.5:32b`  | 32B      | ~22GB    | 是          | 更高质量语义总结   |
| `llama3.3:70b` | 70B      | ~48GB    | 是          | 高端工作站         |
| `phi3.5:mini`  | 3.8B     | ~3GB     | 部分支持    | 仅适合轻量测试     |

如果受显存或运行时限制，实际可用上下文低于 128k，复杂文件上的效果会明显下降。先用 `mode=standard`；如果仍然过重，再使用 `spine llm set prompt-tier lite` 作为高级保护措施。

## 常见问题

**连接被拒绝**

- 确认本地服务已启动
- 确认配置的 base URL 端口填写正确

**质量明显不如云端模型**

- 这是正常现象，小型本地模型的语义能力更弱
- 先使用 `mode=standard`；如果本地限制仍然明显，再使用高级 `prompt-tier lite` 覆盖，并把目标收敛在结构化摘要而不是重度推理

**如何查看模型名称**

- Ollama：执行 `ollama list`
- LM Studio：在 Local Server 页面复制模型标识

另见：

- [LLM 基准](../reference/LLM-BENCHMARKS)
- [快速开始](../tutorials/quick-start)
