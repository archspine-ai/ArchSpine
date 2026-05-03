# Risk Hotspots Report

This document is a generated risk hotspots report for the ArchSpine system. It identifies and ranks files within the codebase that pose the highest risk to project health based on factors such as complexity, change frequency, dependency issues, and architectural violations. The report is experimental and is intended to provide a data-driven snapshot of current risk posture, refreshed on demand via the `spine sync` command.

## Why This Document Exists

The report exists to surface problematic areas of the codebase so that teams can prioritize refactoring, testing, and technical debt reduction. It ranks files by a composite risk score and includes detailed analysis for each high-risk file, enabling targeted improvement efforts. The report is part of the ArchSpine “view” system and is not automatically updated—teams run `spine sync` to generate a fresh snapshot.

## Who Should Read It

Primary audiences are:
- **Developers** wanting to see which files need attention.
- **Software architects** assessing architectural violations or coupling problems.
- **Engineering managers** making resource allocation decisions.
- **QA teams** focusing test coverage on high-risk areas.

## Key Decisions and Workflows It Anchors

- **Prioritization of technical debt**: The risk ranking directly informs which files should be refactored or reviewed first.
- **Test coverage planning**: Teams can use the high-risk file list to decide where to add or increase automated tests.
- **Architecture compliance**: Detailed analysis often reveals rule violations or dependency issues that need architectural remediation.
- **Refresh workflow**: The report is treated as a snapshot—run `spine sync` to regenerate it when the codebase changes. It does not auto-update.

## How to Read This Report

The report consists of two main sections:
1. **Top Risk Files** – a ranked table showing each file, its risk factors, impact level, and numerical score.
2. **Detailed Analysis** – for each file listed, a deeper explanation of why it is considered high risk, including factors like complexity, churn, and specific rule violations.

Use the rankings to focus improvement sprints and the detailed analysis to understand root causes before taking action.