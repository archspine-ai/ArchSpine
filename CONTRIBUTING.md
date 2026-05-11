# Contributing Guide

Thank you for your interest in ArchSpine! We welcome contributions of all kinds — bug fixes, documentation improvements, feature suggestions, and code contributions.

Before you start, please also read:

- [SUPPORT.md](./SUPPORT.md): Whether your issue is a usage question, docs feedback, or feature request
- [SECURITY.md](./SECURITY.md): Do not report security vulnerabilities via public issues
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md): Code of conduct for public collaboration

## Development Setup

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/archspine-ai/archspine.git
    cd archspine
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Build the project**:
    ```bash
    npm run build
    ```
4.  **Run tests**:
    ```bash
    npm run test
    ```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code restructuring (neither new feature nor bug fix)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build tooling, dependencies, or auxiliary changes

Example: `feat(cli): add interactive guide for spine init`

## Contribution Workflow

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request on GitHub.

If you are submitting a public issue, please ensure it contains no credentials, internal repository paths, proprietary code snippets, or other sensitive information.

## Bilingual Documentation Policy

If your changes touch `docs/`, `README.md`, or `README.zh-CN.md`, check the following:

1. Classify the document first  
   New documents must be categorized as either:
   - Public user documentation
   - Internal working documentation

2. Internal docs must not appear in public entry points  
   `docs/design/**`, `docs/planning/**`, `docs/logs/**`, `docs/archive/**`, `docs/validation_plan.md` are considered internal — do not add them to the homepage, README entry points, or VitePress public navigation.

3. Core public paths must have bilingual entry points  
   Pages a new user will encounter first (homepage, quick start, demo, MCP integration, showcase, documentation index) must have both English and Chinese entry points. If only one language is provided in a PR, explain why.

4. Maintain current bilingual structure for specs  
   English specs go under `docs/specs/`, Chinese mirrors under `docs/zh-CN/specs/`. The old `docs/specs/zh-CN/` directory is for historical reference only.

5. When modifying public docs, check if the other language needs synchronization  
   Full sentence-by-sentence translation is not required for every change, but the other language entry point must not become misleading, broken, or out of sync with the actual behavior.

6. After adding new public docs, synchronize three locations:
   - The mapping table in `docs/README.md`
   - The public navigation in `docs/.vitepress/config.ts`
   - The README entry point for the corresponding language

7. English-first detection is for inventory only  
   The convention "no Chinese characters in the first five lines" marks a page as English-preferred. This rule is only for inventory purposes and does not automatically make the page a public entry point.

## License

By contributing code, you agree that your contributions will be licensed under the [Apache-2.0](./LICENSE) license.
