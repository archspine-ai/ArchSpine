# User Domain Service Directory

This directory contains the domain service layer for managing **User** entities within the ArchSpine system. Its primary responsibility is to isolate business logic related to user creation and retrieval, currently backed by an in-memory storage strategy.

## Notable Children

- **user-service.ts** – The sole concrete submodule implementing the domain service. It:
  - Defines the `User` entity interface with `id`, `name`, and `email` properties.
  - Provides in-memory storage and management of `User` entities.
  - Implements user creation with auto-generated IDs.
  - Implements user retrieval by ID.

## Implementation Areas

The most important implementation areas here are the **user creation workflow** (including ID generation) and **user retrieval by identifier**. The in-memory storage approach is a placeholder that can later be replaced by a persistence layer without affecting the domain logic, thanks to the isolation provided by this service.