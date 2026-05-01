# Project: archspine-demo

## Overview
A minimal demonstration project for the ArchSpine protocol.

## Architecture Highlights
- **Domain-Driven Design**: Separates domain logic (`src/domain`) from infrastructure (`src/infra`).
- **Boundary Enforcement**: Includes intentional architectural violations (e.g., API directly calling Infra) to demonstrate ArchSpine's rule checking capabilities.
- **Local Control Plane**: Demonstrates how `.spine/` stores semantic context in the local repository.