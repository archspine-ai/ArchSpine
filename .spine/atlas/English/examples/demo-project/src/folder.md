The `examples/demo-project/src` directory is the backend application source for the demo project. It follows a layered architecture with three main subdirectories:

- **`api`**: HTTP entry point for user creation requests. Handles incoming requests and delegates to the domain layer while managing database connections.
- **`domain`**: Contains the business logic for User entities, including creation and retrieval, using an in-memory store.
- **`infra`**: A stub for database connection management, providing a minimal `Database` class that simulates SQLite or PostgreSQL connection state.

The most important implementation areas are user creation and retrieval, which span all three layers. The `api` module provides the endpoint, the `domain` module encapsulates business rules, and `infra` handles connectivity. This clean separation makes the system easy to extend or replace components.