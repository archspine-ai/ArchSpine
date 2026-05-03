# 📊 LLM Benchmarks & Model Selection Guide

ArchSpine uses a **High-Context Synthesis** approach to maintain high semantic precision. This document provides observed token usage (benchmarks) and guidance on selecting the right LLM provider/model for your project.

---

## 1. Observed Token Benchmarks

The following data points are reconstructed from real synchronization logs of the **ArchSpine** repository itself (approx. 100 source files).

### 📐 Standard Mode (High-Precision)

_This mode sends the full source header, structural skeletons of all dependencies, architectural rules, and git intent._

| File Complexity | Example File                 | Observed Input Tokens | Note                                  |
| :-------------- | :--------------------------- | :-------------------- | :------------------------------------ |
| **Small**       | `README.md`                  | ~4,000 - 9,000        | Basic content only.                   |
| **Medium**      | `src/core/sync.ts`           | ~25,000 - 35,000      | 10+ internal dependencies.            |
| **High**        | `src/ast/extractor.ts`       | **~55,351**           | Complex AST logic + multiple parsers. |
| **Large Spec**  | `archspine-protocol-v0.3.md` | **~52,021**           | Extensive prose + formatting.         |

### ⚡ Constrained Runtime Fallback

_On low-TPM providers, ArchSpine may use a lighter runtime path internally to keep generation within budget._

| File Complexity | Example File | Target Input Tokens | Note                                                   |
| :-------------- | :----------- | :------------------ | :----------------------------------------------------- |
| **All Files**   | Any          | **< 8,000**         | Internal low-budget fallback for constrained runtimes. |

---

## 2. Model Selection Matrix

Choosing the right model depends on two primary metrics: **Context Window** and **TPM (Tokens Per Minute)**.

| Model Tier          | Providers                      | Best For                                | Context             | Min. TPM                                                                                        |
| :------------------ | :----------------------------- | :-------------------------------------- | :------------------ | :---------------------------------------------------------------------------------------------- |
| **Performance**     | Claude 3.5 Sonnet, GPT-4o      | Large codebases, complex rules.         | 128k - 200k         | > 300,000                                                                                       |
| **Economy**         | **DeepSeek-V3 / R1**           | **Best ROI for ArchSpine.**             | 128k                | > 500,000                                                                                       |
| **Local / Offline** | Ollama, LM Studio              | Privacy-first, air-gapped environments. | 128k (VRAM-limited) | N/A — start with `mode=standard`; constrained runtimes may fall back to a lighter internal path |
| **Limited/Free**    | Groq (Free), OpenRouter (Free) | Small projects, MVP testing.            | 128k                | start with `mode=standard`; constrained runtimes may fall back to a lighter internal path       |

---

## 3. Critical Concepts

### TPM vs. Context Window

- **Context Window (128k+)**: Most modern models support 128k tokens. This is **sufficient** for ArchSpine's deep synthesis.
- **TPM (Tokens Per Minute)**: This is the primary bottleneck for free APIs.
  - _Free Tiers_ (e.g., Groq) often limit you to **12k TPM**.
  - _Observation_: Since a single core file can require **55k tokens**, a 12k TPM limit will cause immediate failure unless the runtime reduces prompt budget internally.

---

## 4. Optimization Recommendations

1.  **Use DeepSeek**: For most users, DeepSeek provides the best balance of context window, high TPM limits, and low cost.
2.  **Start with `mode=standard` on constrained providers**: Free tiers and low-TPM environments should usually start with `spine llm set mode standard`.
3.  **Use runtime mode as the public control surface**: If `mode=standard` is still too heavy on constrained providers, treat lighter generation behavior as an internal runtime fallback rather than a primary user-facing knob.
4.  **Local LLMs (Ollama / LM Studio)**: See the dedicated guide → [`docs/how-to/LOCAL-LLM.md`](../how-to/LOCAL-LLM).

## 5. Benchmark scope

These benchmarks exist to evaluate internal strategy choices that may later be absorbed into the default behavior of `mode=standard|heavy`. The strategy work serves the mode defaults; it does not replace the mode-first product surface with low-level runtime knobs.

For normal usage, prefer the higher-level runtime modes:

```bash
spine llm set mode standard
spine llm set mode heavy
```
