# Local LLM Guide (Ollama / LM Studio)

ArchSpine speaks to LLM providers through an OpenAI-compatible HTTP interface, so you can point it at local inference stacks such as Ollama or LM Studio without changing runtime code.

> [!NOTE]
> Local models are best for privacy-sensitive or offline workflows.
> Start with `spine llm set mode standard`. If VRAM or local context limits are still tight, use the advanced `prompt-tier lite` override as a fallback.

## Option 1: Ollama

### 1. Install and start Ollama

```bash
# Install (macOS)
brew install ollama

# Pull a model with enough context
ollama pull qwen2.5:14b
# or
ollama pull llama3.3:70b

# Start the local API server
ollama serve
```

### 2. Configure ArchSpine

```bash
spine llm set provider openai
spine llm set base-url http://localhost:11434/v1
spine llm set model qwen2.5:14b
spine llm set api-key ollama
spine llm set mode standard
```

### 3. Verify the connection

```bash
curl http://localhost:11434/v1/models
spine build
```

## Option 2: LM Studio

### 1. Start the local server

1. Install [LM Studio](https://lmstudio.ai/)
2. Load a model with enough usable context, such as Qwen2.5-14B-Instruct or Llama 3.3 70B
3. Start the Local Server, usually on port `1234`

### 2. Configure ArchSpine

```bash
spine llm set provider openai
spine llm set base-url http://localhost:1234/v1
spine llm set model <your model identifier from LM Studio>
spine llm set api-key lm-studio
spine llm set mode standard
```

## Model suggestions

| Model          | Size | Approx. VRAM | 128k context | Recommended use          |
| -------------- | ---- | ------------ | ------------ | ------------------------ |
| `qwen2.5:14b`  | 14B  | ~10GB        | Yes          | Best day-to-day balance  |
| `qwen2.5:32b`  | 32B  | ~22GB        | Yes          | Higher-quality summaries |
| `llama3.3:70b` | 70B  | ~48GB        | Yes          | High-end workstation     |
| `phi3.5:mini`  | 3.8B | ~3GB         | Partial      | Lightweight testing only |

If the real usable context window is below 128k because of VRAM or runtime limits, expect weaker results on files with large dependency surfaces. Start with `mode=standard`; if that is still too heavy, `spine llm set prompt-tier lite` is the advanced safety rail.

## Common issues

**Connection refused**

- Confirm the local server is running
- Confirm the configured base URL matches the port you actually exposed

**Output quality is much worse than cloud models**

- That is expected for smaller local models
- Start with `mode=standard`; if local limits are still too tight, use the advanced `prompt-tier lite` override and keep expectations closer to structured summaries than full semantic reasoning

**How do I find the model name?**

- Ollama: run `ollama list`
- LM Studio: copy the model identifier from the Local Server screen

See also:

- [LLM Benchmarks](../reference/LLM-BENCHMARKS)
- [Quick Start](../tutorials/quick-start)
