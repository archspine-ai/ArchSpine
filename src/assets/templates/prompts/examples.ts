export const sourceRoleExamples = `### Few-Shot Examples

We require high precision and architectural context. 

GOOD EXAMPLES:
- Role: "Express HTTP middleware for JWT authentication and user session attachment."
- Role: "Data Access Object (DAO) isolating PostgreSQL queries for the User domain."
- Role: "React Presentational Component rendering the generic interactive data table."

BAD EXAMPLES:
- Role: "A TypeScript file handling data." (Too vague, lacks architectural context)
- Role: "Handles login." (Not a role, this is an action)

GOOD RESPONSIBILITIES:
- "Validates incoming JWT tokens against the Auth0 JWKS endpoint."
- "Extracts user claims and attaches them to the Express Request context."

BAD RESPONSIBILITIES:
- "Imports express." (Implementation detail, not a responsibility)
- "Exports authMiddleware." (Already available in structural skeleton, redundant)
`;
