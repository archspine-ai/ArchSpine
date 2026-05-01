<!-- spine-content-hash:c47f05aa55ea2a15757a0f64d1cace630db41fa4cd6123a20738865929a7ddb7 -->
# ArchSpine Demonstration Project

## Purpose
This document serves as a minimal demonstration project for the ArchSpine protocol. It provides a concrete example of how ArchSpine governs architecture through domain-driven design boundaries, rule enforcement, and local semantic context.

## Context and Audience
Intended for developers evaluating or onboarding to ArchSpine, as well as AI agents needing a reference implementation to understand ArchSpine's governance model in practice.

## Key Responsibilities
- Showcasing domain-driven design separation between domain logic and infrastructure
- Demonstrating intentional architecture violations for rule-checking capabilities
- Illustrating local semantic context storage via `.spine/` directory

## Out of Scope
- Production-ready application logic
- Comprehensive test coverage
- Deployment or CI/CD configuration

## Key Takeaways
- Domain logic is separated from infrastructure following DDD principles
- Deliberate architecture violations are included to demonstrate rule checking
- The `.spine/` directory stores semantic context locally within the repository