export const sourceRoleExamples = `### Few-Shot Examples

We require high precision and architectural context.

GOOD EXAMPLES:
- Role: "Express HTTP middleware for JWT authentication and user session attachment."
- Role: "Data Access Object (DAO) isolating PostgreSQL queries for the User domain."
- Role: "React Presentational Component rendering the generic interactive data table."

BAD EXAMPLES:
- Role: "A TypeScript file handling data." (Too vague, lacks architectural context)
- Role: "Handles login." (Not a role, this is an action)

GOOD PUBLIC SURFACE ENTRIES:
- { "symbolName": "authenticateToken", "description": "Validates JWT tokens and attaches user claims to the request context. Called by every protected route." }
- { "symbolName": "UserRepository", "description": "Primary data-access interface for user CRUD operations. Consumed by AuthService and UserController." }

BAD PUBLIC SURFACE ENTRIES:
- { "symbolName": "handleRequest", "description": "Handles requests." } (Too vague — what kind of requests? What does it do with them?)
- { "symbolName": "config", "description": "Configuration." } (No actionable information for consumers)

GOOD DRIFT DETECTION:
- driftDetected: true, driftReason: "The module previously handled only JWT auth but now also manages OAuth2 token exchange. Two new public symbols added: exchangeOAuthToken, refreshOAuthToken."
- driftDetected: false — when the file's role, responsibilities, and public surface remain semantically consistent with the previous contract, even if implementation details changed.

BAD DRIFT DETECTION:
- driftDetected: true, driftReason: "Code changed." (Does not explain WHAT changed semantically — completely unactionable)
`;
