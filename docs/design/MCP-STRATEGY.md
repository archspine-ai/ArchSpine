# ArchSpine MCP Strategy

This document describes MCP as both a product-delivery layer and a potential commercialization path.

## Local MCP vs cloud MCP

The deployment model determines whether MCP is pure adoption infrastructure or part of a revenue product.

| Dimension      | Local MCP                        | Cloud MCP                                |
| -------------- | -------------------------------- | ---------------------------------------- |
| Transport      | STDIO                            | HTTPS / SSE / WebSocket                  |
| Location       | Developer workstation            | Hosted control plane                     |
| Scope          | One local checkout               | Multi-repo, cross-service, org-level     |
| Cost model     | User pays for their own provider | Provider and data access can be bundled  |
| Strategic role | Adoption and standard-setting    | Enterprise coordination and monetization |

## Phase 1: local MCP

The open-source CLI should make local MCP feel immediate and low-friction.

Value:

- zero server requirement
- a strong first-use experience
- faster adoption because the integration path is simple

This is the right approach for the current `v1.0.x` line.

## Phase 2: hosted MCP

Once teams need cross-repository reasoning, local MCP stops being enough. That is the point where a hosted control plane becomes meaningful.

Potential hosted value:

- organization-wide `.spine` aggregation
- cross-service dependency queries
- centrally managed governance and audit history
- authenticated remote access for enterprise agent tooling

## Strategic conclusion

The correct sequencing is:

1. use local MCP to establish the workflow and adoption surface
2. prove that `.spine` is valuable as a repository contract
3. only then extend MCP into a cloud control plane for organization-scale use cases
