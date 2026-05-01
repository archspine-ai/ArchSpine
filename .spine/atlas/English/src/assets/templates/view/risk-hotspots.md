# ArchSpine Risk Hotspots Report

## Purpose

This document is a risk assessment report for the ArchSpine project. It identifies files that pose the highest maintenance or stability risks based on factors such as code complexity, change frequency, and dependency coupling. The report helps teams focus refactoring efforts and code review resources on the most fragile areas of the codebase.

## Audience

This report is intended for developers, tech leads, and maintainers who need to:
- Prioritize refactoring and technical debt reduction
- Allocate code review resources effectively
- Identify fragile or high-risk areas in the codebase

The report is automatically generated and should be refreshed regularly via `spine sync` to stay current.

## Key Takeaways

- Files are ranked by a composite risk score that combines multiple factors
- Each risk hotspot includes a breakdown of contributing risk factors and their impact
- The report is experimental and requires manual refresh to remain up-to-date

## Report Structure

The report contains two main sections:

1. **Top Risk Files** – A ranked table of files with their risk factors, impact, and composite score
2. **Detailed Analysis** – In-depth breakdown of each risk hotspot, including specific risk factor contributions

## Workflow Anchors

This report anchors the following decisions and workflows:
- **Maintenance prioritization**: Teams use the risk rankings to decide which files to refactor first
- **Code review scheduling**: High-risk files are flagged for mandatory review before changes
- **Technical debt tracking**: The report provides a baseline for measuring risk reduction over time