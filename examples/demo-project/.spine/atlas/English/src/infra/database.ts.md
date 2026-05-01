# File: src/infra/database.ts

## Role
Database Infrastructure and Persistence Layer

## Responsibility
- Implements the `Database` class for managing low-level connection state.
- Provides a generic `query` method for executing SQL-like commands.
- Handles database connection lifecycle (connect/disconnect).
- Serves as the concrete implementation of data persistence for the application.