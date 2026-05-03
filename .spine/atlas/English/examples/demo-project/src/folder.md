This directory is a sample project that demonstrates the ArchSpine architecture by implementing a minimal user management system. It is organized into three primary submodules that correspond to the architectural layers: **API**, **Domain**, and **Infrastructure**.

- **`api/`** – The HTTP entry point that receives user creation requests and delegates to the domain service. This layer also directly manages the database connection lifecycle, which intentionally illustrates a common deviation from the intended layered architecture.

- **`domain/`** – The domain service layer that defines the `User` entity interface (with `id`, `name`, and `email` properties) and provides in-memory storage and management of users, including auto-generated IDs and retrieval by ID.

- **`infra/`** – The database infrastructure layer, which exports a `Database` class that handles connection state and exposes a `connect` method for establishing connections to SQLite or PostgreSQL.

The most important implementation areas are the boundary between the API and domain layers (where the architectural deviation occurs) and the placeholder nature of the infrastructure layer, which is designed for easy replacement with a real database adapter.