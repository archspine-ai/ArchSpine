<!-- spine-content-hash:dab4ff9d929aa40e91305f7a0b3f6e649e0bec095309ecba61d1a37460194f82 -->
# ArchSpine Build Script

## Purpose
This document defines the build pipeline for the ArchSpine project. It ensures that TypeScript source code is compiled, rule files and assets are copied to the distribution folder, and mock directories are excluded from the final output.

## Context & Audience
Intended for developers maintaining the ArchSpine build process. It explains how the distribution artifact is assembled and what steps are taken to keep the output clean and executable.

## Key Responsibilities
- Compile TypeScript source into JavaScript using `tsc`
- Copy AST rule files from `src` to `dist`
- Copy static assets from `src/assets` to `dist/assets`
- Remove `__mocks__` directories from the `dist` output
- Set executable permissions on the CLI entry point

## Out of Scope
- Unit or integration testing logic
- Runtime behavior of the mirror system
- Configuration or schema definitions for ArchSpine

## Key Takeaways
- The build process runs `tsc`, then copies rules and assets into `dist/`
- Mock directories (`__mocks__`) are explicitly removed from the dist tree
- The CLI entry point is made executable after compilation