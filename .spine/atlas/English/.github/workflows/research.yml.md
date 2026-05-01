<!-- spine-content-hash:8284bb33192599f227cc151b55510c51b9020ae389655da165d2a8fe11a56bd4 -->
# ArchSpine – Research Bench Workflow

## Purpose
This document defines a GitHub Actions workflow called **Research Bench** that provides a controlled, manual-trigger environment for running research-level test suites. It ensures that experimental or exploratory tests can be executed in isolation without interfering with standard CI pipelines.

## Context & Audience
This workflow is intended for developers and researchers working on the ArchSpine project who need to run specialized test suites that are not part of the regular build or test process. It is designed for manual invocation via the GitHub UI or API, making it suitable for ad-hoc testing scenarios.

## Key Takeaways
- Workflow is manually triggered only (`workflow_dispatch`), not automatic
- Runs on Ubuntu with Node.js 20 and npm dependency caching
- Executes the research test suite via `npm run test:research`
- Has a 15-minute timeout and cancels in-progress runs for the same workflow/ref