<!-- spine-content-hash:6f65dfac9afba7069fc942bfb479bd17035daa82b841759237d1d4989744df42 -->
# ArchSpine Rules Directory Summary

## Purpose
This document summarizes the `.spine/rules` directory, which is the central repository for architectural and governance rules within the ArchSpine mirror system. It explains the role of this directory in enforcing project-wide constraints and standards.

## Context and Audience
This summary is intended for developers, architects, and AI agents who need to understand where and how rules are defined and maintained. It is relevant for anyone contributing to or auditing the governance structure of an ArchSpine-managed project.

## Key Takeaways
- The `.spine/rules` directory is the single source of truth for project governance rules.
- Rules defined here are consumed by the scanner and validator engines to enforce architectural constraints.
- This directory is separate from source code and runtime configuration.

## File Role
The `.spine/rules` directory houses rule documents that enforce architectural constraints and coding standards. It provides a structured location for rule definitions that the scanner and validator engines consume, and serves as the authoritative source for project-wide governance policies.

## Key Responsibilities
- Houses rule documents that enforce architectural constraints and coding standards.
- Provides a structured location for rule definitions that the scanner and validator engines consume.
- Serves as the authoritative source for project-wide governance policies.

## Notable Invariants and Negative Scope
- **Out of Scope:** This directory does not contain source code or implementation logic. It does not store user data or runtime configuration. It does not include documentation for specific project modules or features.
- **Invariants:** No invariants are currently defined for this directory.

## Most Important Exported or Externally Visible Behavior
The primary externally visible behavior of this directory is that it is consumed by the scanner and validator engines. Any changes to the rules defined here will directly affect the enforcement of architectural constraints and coding standards across the project.