<!-- spine-content-hash:0de48a7c61fe6f1c8f51b0886997c2cdef8dbf5ba768236889f92c07eba43050 -->
# ArchSpine Architectural Governance Rules

## Purpose
This document establishes and enforces a strict layered architecture model for the ArchSpine project, ensuring that high-level domain modules remain pure and independent from low-level infrastructure or presentation concerns.

## Context and Audience
This document is intended for all developers contributing to the ArchSpine codebase, particularly those working on domain logic, API layers, or infrastructure modules. It serves as a reference for maintaining architectural integrity during development and code review.

## Key Responsibilities
- Defining layered architecture constraints for the ArchSpine project
- Specifying dependency rules between domain, infrastructure, API, and CLI layers
- Enforcing domain isolation and preventing reverse dependencies

## Out of Scope
- Implementation details of specific modules
- Testing strategies or test code organization
- Deployment or infrastructure configuration

## Key Takeaways
- Domain modules must never import from infrastructure or CLI layers
- Domain should only depend on internal domain logic or generic utilities
- API layers must only call Service or Domain layers, never bypass business logic