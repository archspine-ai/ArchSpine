# Security Policy

## Reporting A Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Report suspected vulnerabilities privately to the maintainers with:

- a clear description of the issue
- affected versions or commit range when known
- reproduction steps or proof of concept
- impact assessment
- any suggested mitigation

To report a vulnerability, please email [izoyin27@gmail.com](mailto:izoyin27@gmail.com). Expect an acknowledgment within 72 hours.

## Response Expectations

- We will acknowledge receipt as soon as practical.
- We will validate the report, assess impact, and decide on remediation scope.
- We may ask for extra reproduction details if the report is incomplete.
- We will aim to coordinate disclosure after a fix or mitigation is available.

## Scope

Please report vulnerabilities related to:

- the ArchSpine CLI and runtime behavior
- MCP server exposure or unsafe local data access
- credential handling, config persistence, or secret leakage
- package publishing or supply-chain risks introduced by this repository

General support questions, feature requests, and documentation issues should go through [SUPPORT.md](./SUPPORT.md) or the public issue templates.

## Supported Versions

Security fixes are expected to target the latest maintained release line first. At the moment, treat the current `main` branch and the latest published npm version as the primary supported targets.
