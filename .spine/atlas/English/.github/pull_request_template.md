# ArchSpine Pull Request Template

## Purpose

This document provides a standardized pull request template for the ArchSpine project. It ensures that every proposed change is clearly described, motivated, tested, and documented before being merged into the codebase.

## Who Should Read This

- **Contributors** who are submitting pull requests to ArchSpine
- **Maintainers** who review and approve pull requests
- **Project leads** who want to enforce consistent quality standards across all changes

## Key Decisions and Workflows

The template anchors the following critical workflows:

1. **Change Description** – Every PR must include a concise summary (2-5 sentences) explaining what the change does.
2. **Motivation** – Contributors must articulate the problem being solved or the user-facing impact of the change.
3. **Testing Validation** – All changes must be validated by running `npm run build`, `npm test`, and `npm run validate`. Contributors can mark "Not applicable" if testing is not relevant.
4. **Documentation Impact** – Contributors must explicitly state whether README or other documentation needs updating, or confirm that no docs changes are required.

## How to Use This Template

When creating a pull request, fill out each section completely. The template ensures that reviewers have all necessary context to evaluate the change efficiently and that the project maintains high quality standards.