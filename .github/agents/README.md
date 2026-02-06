# Custom GitHub Copilot Agents

This directory contains specialized agents designed to assist with different aspects of the URL shortener project development.

## Available Agents

### 🗄️ Database Agent (`database.md`)

**Specialization**: Supabase operations, schema design, and database optimization

**Use for:**

- Designing new database tables or modifying schemas
- Writing complex Supabase queries
- Optimizing database performance
- Implementing analytics features
- Database migration strategies

**Example prompts:**

- "Design a table to track user sessions"
- "Optimize the query for fetching click analytics"
- "Add an index to improve slug lookup performance"
- "Create a migration to add a new column to short_links"

### 🔌 API Agent (`api.md`)

**Specialization**: Next.js App Router API routes, request validation, and error handling

**Use for:**

- Creating new API endpoints
- Adding request validation
- Implementing error handling
- Reviewing API route code
- RESTful API design

**Example prompts:**

- "Create an API endpoint to fetch analytics for a slug"
- "Add validation for URL format in POST /api"
- "Implement rate limiting for the API"
- "Add pagination to the links list endpoint"

### 🧪 Testing Agent (`testing.md`)

**Specialization**: Jest, React Testing Library, test coverage, and quality assurance

**Use for:**

- Writing comprehensive tests
- Improving test coverage
- Mocking complex dependencies
- Integration testing strategies
- Fixing failing tests

**Example prompts:**

- "Write tests for the new analytics endpoint"
- "Add component tests for the URL form"
- "Mock Supabase for the API route tests"
- "Create integration tests for the link creation flow"

### 🐛 Debug Agent (`debug.md`)

**Specialization**: Troubleshooting, root cause analysis, and bug fixing

**Use for:**

- Diagnosing errors and bugs
- Performance issues
- Understanding error logs
- Implementing fixes with regression tests
- Systematic debugging

**Example prompts:**

- "The API is returning 500 errors, help me debug"
- "Why isn't my component re-rendering?"
- "Fix the slug collision issue"
- "Performance is slow, help me identify bottlenecks"

## How to Use Agents

GitHub Copilot automatically uses these agent instructions when the context is relevant. You can also explicitly invoke an agent by mentioning it:

### Method 1: Natural Context

Just work on relevant tasks and Copilot will use the appropriate agent:

```
- Working on API routes → API Agent activates
- Writing tests → Testing Agent activates
- Debugging errors → Debug Agent activates
- Database queries → Database Agent activates
```

### Method 2: Explicit Mention

Reference the agent in your prompt:

```
"@database help me design a table for user analytics"
"@api create an endpoint to delete short links"
"@testing write comprehensive tests for this component"
"@debug why is this query returning null?"
```

### Method 3: Agent Mode

Use GitHub Copilot's agent mode for complex, multi-step tasks:

```
1. Press Cmd+Shift+I (Mac) or Ctrl+Shift+I (Windows/Linux)
2. Type your request
3. Copilot will automatically use relevant agents
```

## Agent Collaboration

Agents are designed to work together. For example:

**Creating a new feature:**

1. **Database Agent**: Design the schema
2. **API Agent**: Create the endpoints
3. **Testing Agent**: Write comprehensive tests
4. **Debug Agent**: Fix any issues that arise

**Fixing a bug:**

1. **Debug Agent**: Identify the root cause
2. **API Agent** or **Database Agent**: Implement the fix
3. **Testing Agent**: Add regression tests

## Best Practices

### 1. Be Specific

❌ "Help me with the API"
✅ "Create a GET endpoint at /api/analytics/[slug] that returns click count and recent clicks"

### 2. Provide Context

Include relevant information:

- What you're trying to accomplish
- What you've already tried
- Error messages or unexpected behavior
- Relevant file paths or code snippets

### 3. Use Iterative Refinement

Start with a high-level request, then refine:

1. "Design a table for analytics"
2. "Add indexes for performance"
3. "Write a query to fetch top 10 most clicked links"

### 4. Request Tests

Always ask for tests when implementing features:

- "Create this endpoint and write tests for it"
- "Add validation and include test cases"

### 5. Review and Learn

After the agent provides a solution:

- Review the code to understand the approach
- Ask questions if something is unclear
- Request explanations for complex parts

## Examples of Good Prompts

### Database Tasks

```
"I need to add a feature to track when links expire. Design a schema
change that adds an expiration date to short_links and explain how to
query for expired links."
```

### API Tasks

```
"Create a DELETE endpoint at /api/[slug] that:
1. Validates the slug exists
2. Soft-deletes the link (adds deleted_at timestamp)
3. Returns appropriate status codes
4. Includes proper logging"
```

### Testing Tasks

```
"Write comprehensive tests for the POST /api endpoint including:
- Success case with valid URL
- Validation errors
- Database errors
- Slug collision handling
Use proper mocking for Supabase"
```

### Debugging Tasks

```
"I'm getting a 500 error when trying to create a short link. The logs show:
[ERROR]: Database error: duplicate key value violates unique constraint
Help me debug this and implement proper error handling."
```

## Maintenance

### Adding New Agents

To create a new specialized agent:

1. Create a new `.md` file in this directory
2. Follow the structure of existing agents
3. Include expertise, patterns, examples, and when to use it
4. Update this README

### Updating Agents

When project patterns or best practices change:

1. Update the relevant agent instruction file
2. Ensure consistency across all agents
3. Update examples to reflect current code

### Agent Effectiveness

These agents are most effective when:

- You provide clear, specific requests
- You include relevant context
- You iterate and refine requirements
- You review and test the generated code

---

**Remember**: These agents are here to help you write better code faster. Don't hesitate to ask for explanations, request alternatives, or iterate on solutions!
