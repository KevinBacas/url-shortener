# GitHub Copilot Instructions for URL Shortener Project

## Project Overview

This is a Next.js 16+ URL shortener application using the App Router, TypeScript, Supabase, and Tailwind CSS. The application allows users to create shortened URLs and tracks click analytics.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict type safety required)
- **Database**: Supabase (PostgreSQL)
- **Logging**: Winston
- **Testing**: Jest + React Testing Library
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS v4
- **ID Generation**: Nanoid (custom alphabet for slugs)

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/         # API endpoints
│   │   ├── route.ts       # POST /api - Create short link
│   │   ├── [id]/         # GET /api/[id] - Redirect
│   │   └── analytics/    # GET /api/analytics - Analytics data
│   ├── analytics/   # Analytics page
│   │   ├── page.tsx      # Analytics Server Component
│   │   └── loading.tsx   # Loading state
│   ├── error.tsx    # Global error boundary
│   ├── not-found.tsx # 404 page
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Homepage
├── components/      # React components
│   ├── ui/         # Shadcn UI components (DO NOT MODIFY)
│   ├── analytics-list.tsx # Analytics display (Client Component)
│   └── homepage-form.tsx  # URL shortening form (Client Component)
├── lib/            # Core utilities
│   ├── analytics.ts  # Analytics data fetching
│   ├── api-types.ts  # API response types
│   ├── env.ts        # Environment variable validation
│   ├── logger.ts     # Winston logger configuration
│   └── utils.ts      # Helper functions
└── utils/          # Third-party integrations
    └── supabase/   # Supabase client configuration
        ├── client.ts # Browser client (anon key)
        └── server.ts # Server client (service key)
types/              # Generated TypeScript definitions
└── database.types.ts  # Supabase generated types + aliases
```

## Database Schema

### Tables

**short_links**

- `id`: number (auto-increment primary key)
- `slug`: string (unique identifier for shortened URL)
- `target_url`: string (original URL)
- `user_id`: string (UUID)
- `created_at`: timestamp

**link_clicks**

- `id`: number (auto-increment primary key)
- `short_link_id`: number (foreign key → short_links.id)
- `clicked_at`: timestamp
- `user_agent`: string (nullable)
- `referrer`: string (nullable)
- `created_at`: timestamp
  lib/api-types

### Type Usage

- Always use types from `types/database.types.ts`
- Use simplified type aliases: `ShortLink`, `ShortLinkInsert`, `LinkClick`, `LinkClickInsert`
- Use API response types from `src/types/api.ts` in client-side code
- For complex types, use `LinkWithClicks` from `@/lib/analytics`

## Coding Standards

### General Guidelines

- Follow Next.js and React best practices
- Use functional components and hooks exclusively
- Maintain strict TypeScript type safety (no `any`)
- Write clean, self-documenting code with comments for complex logic
- Prefer composition over inheritance
- Use async/await over promises

### API Routes

- All API routes should use Next.js App Router conventions (`route.ts`)
- Always validate request bodies and return appropriate error responses
- Use `NextRequest` and `NextResponse` types
- Return JSON responses with proper status codes and headers
- Log all requests and errors using the Winston logger
- **CRITICAL**: Import Supabase from `@/utils/supabase/server` in API routes, not from `client`

**Example Pattern:**

```typescript
import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import supabase from "@/utils/supabase/server"; // Use server client in API routes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info(`Request received: ${JSON.stringify(body)}`);

    // Validation
    if (!body.field) {
      logger.warn("Missing required field");
      return new Response(
        JSON.stringify({ error: "Field is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Database operation
    const { data, error } = await supabase.from("table").insert([...]);

    if (error) {
      logger.error(`Database error: ${error.message}`);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    logger.info(`Operation successful`);
    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error(`Unexpected error: ${error}`);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
```

### Logging

- Use the Winston logger from `@/lib/logger` for all logging
- Log levels: `info`, `warn`, `error`
- Always log:
  - Incoming API requests with relevant data
  - Database operations (before and after)
  - Errors with full context
  - Important business logic steps

**Pattern:**

```typescript
import logger from "@/lib/logger";

logger.info(`Action performed: ${details}`);
logger.warn(`Warning condition: ${condition}`);
logger.error(`Error occurred: ${error.message}`);
```

### Slug Generation

- Use `nanoid` with custom alphabet for generating short URL slugs
- Use centralized configuration from `@/lib/env`
- Implement collision detection with retry logic

**Pattern:**

```typescript
import { customAlphabet } from "nanoid";
import { nanoidConfig } from "@/lib/env";

const nanoid = customAlphabet(nanoidConfig.alphabet, nanoidConfig.length);
const slug = nanoid();

// For slug collision handling:
const { data: existing } = await supabase
  .from("short_links")
  .select("slug")
  .eq("slug", slug)
  .maybeSingle();

if (!existing) {
  // Slug is unique, proceed
}
```

### Client Components

- Always use `"use client"` directive at the top of files with hooks or browser APIs
- Use React hooks appropriately (useState, useEffect, etc.)
- Handle loading and error states properly
- Use the `sonner` toast library for user notifications

### Supabase Integration

- **Server-side**: Import from `@/utils/supabase/server` (uses service key with admin privileges)
  - Use in: API routes, Server Components, Server Actions
  - Has full access, bypasses Row Level Security
- **Client-side**: Import from `@/utils/supabase/client` (uses anonymous key)
  - Use in: Client Components, browser code
  - Respects Row Level Security policies
- Always handle errors from Supabase operations
- Use the `.select()` method to return inserted/updated data
- Use `.single()` when expecting one result
- Use `.maybeSingle()` when result might not exist (avoids throwing on no results)

## Testing Requirements

### Test Coverage

- Write tests for all API routes
- Write unit tests for utility functions
- Write integration tests for database operations
- Write component tests for interactive UI elements

### Testing Patterns

- Place tests alongside source files (`*.test.ts` or `*.test.tsx`)
- Use descriptive test names: `describe` blocks for grouping, `it` for individual tests
- Mock external dependencies (Supabase, fetch, etc.)
- Use `@testing-library/react` for component testing
- Use `@testing-library/jest-dom` for DOM assertions

**Example:**

```typescript
import { POST } from "./route";
import { NextRequest } from "next/server";

describe("POST /api", () => {
  it("should return 400 if URL is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
```

### Running Tests

- Run tests with: `npm test` (runs linter + Jest)
- Run only Jest: `npx jest`
- Run with coverage: `npx jest --coverage`
- Ensure all tests pass before committing

## Styling Guidelines

- Use Tailwind CSS v4 utility classes for all styling
- Follow mobile-first responsive design
- Use CSS variables for theme colors (defined in `globals.css`)
- Avoid inline styles; prefer Tailwind utilities
- Use `cn()` utility from `@/lib/utils` for conditional class merging

## Folder Exclusions

### ⚠️ CRITICAL: Shadcn UI Components

**DO NOT modify, suggest changes to, or generate code for files in `src/components/ui/`**

This folder contains pre-built Shadcn UI components. These are third-party components that should remain unchanged. If modifications are needed:

1. Create a wrapper component in `src/components/`
2. Import the UI component and extend it there

## Accessibility

- Ensure all interactive elements are keyboard accessible
- Provide ARIA labels where necessary
- Use semantic HTML elements
- Test with screen readers when implementing new UI features
- Ensure sufficient color contrast ratios

## Performance Best Practices

- Use dynamic imports for large components (`next/dynamic`)
- Implement proper loading states
- Avoid unnecessary re-renders (use `React.memo`, `useMemo`, `useCallback`)
- Optimize images with next/image
- Keep bundle sizes minimal

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (client-side)
- `SUPABASE_SERVICE_KEY`: Supabase service key (server-side only, **never expose to client**)
- `CUSTOM_NANOID_ALPHABET`: Custom alphabet for slug generation (optional)
- `CUSTOM_NANOID_LENGTH`: Length of generated slugs (optional, default: 6)
- `NODE_ENV`: Environment mode (development/production)

**Security Note**: `SUPABASE_SERVICE_KEY` has admin privileges. Only use in server-side code.

## Git Workflow

This project follows the **Gitflow branching model**. All contributors must adhere to this workflow.

### Branch Structure

**Main Branches** (protected, never delete):

- `main` - Production-ready code. Only updated via merges from `release/*` or `hotfix/*` branches. Always tagged with version numbers.
- `develop` - Integration branch for features. Reflects the latest development changes for the next release.

**Supporting Branches** (temporary, delete after merge):

- `feature/*` - New features and non-emergency bug fixes
- `release/*` - Preparation for production release (version bump, final testing, bug fixes)
- `hotfix/*` - Critical production bug fixes

### Branch Naming Conventions

- Feature branches: `feature/<issue-number>-<short-description>` (e.g., `feature/123-add-user-profile`)
- Release branches: `release/<version>` (e.g., `release/1.2.0`)
- Hotfix branches: `hotfix/<version>` (e.g., `hotfix/1.2.1`)

Use kebab-case for descriptions. Keep branch names concise but descriptive.

### Workflow

#### Feature Development

1. **Start a new feature:**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/123-new-feature
   ```

2. **Work on the feature:**
   - Make commits with meaningful messages
   - Run tests and linter before committing: `npm test && npm run lint`
   - Keep commits focused and atomic
   - Push regularly to remote: `git push origin feature/123-new-feature`

3. **Complete the feature:**
   - Ensure all tests pass
   - Update documentation if needed
   - Create a Pull Request (PR) to merge into `develop`
   - Request code review
   - After approval and merge, delete the feature branch

#### Release Process

1. **Start a release:**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/1.2.0
   ```

2. **Prepare the release:**
   - Bump version in `package.json`
   - Update `CHANGELOG.md` or release notes
   - Fix release-specific bugs (only critical fixes, no new features)
   - Run full test suite: `npm test`

3. **Finalize the release:**
   - Create PR to merge into `main`
   - After merge to `main`, tag the release: `git tag -a v1.2.0 -m "Release 1.2.0"`
   - Merge back into `develop` to include any release fixes
   - Delete the release branch

#### Hotfix Process

1. **Start a hotfix:**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/1.2.1
   ```

2. **Apply the fix:**
   - Fix the critical bug
   - Bump patch version in `package.json`
   - Test thoroughly: `npm test`

3. **Finalize the hotfix:**
   - Create PR to merge into `main`
   - After merge to `main`, tag the hotfix: `git tag -a v1.2.1 -m "Hotfix 1.2.1"`
   - Merge back into `develop` (or current `release/*` if exists)
   - Delete the hotfix branch

### Merge Strategy

- Use **squash merging** for feature branches to keep history clean
- Use **merge commits** for release and hotfix branches to preserve history
- Never force push to `main` or `develop`
- Always create PRs for merging; direct commits to protected branches are forbidden

### Commit Message Conventions

Follow the format: `<type>(<scope>): <description>`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Example:**

```
feat(api): add rate limiting to short link creation
fix(analytics): correct click count calculation
docs(readme): update deployment instructions
```

### Pre-commit Checklist

Before every commit:

- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] Code follows project conventions
- [ ] Relevant documentation updated
- [ ] Commit message follows conventions

### Pull Request Guidelines

- Provide a clear title and description
- Reference related issues (e.g., "Closes #123")
- Ensure CI/CD checks pass
- Request at least one code review
- Address all review comments before merging
- Keep PRs focused and reasonably sized

## Documentation

- Document all exported functions and complex algorithms
- Use JSDoc comments for TypeScript type annotations
- Update this instruction file when architectural decisions change
- Keep README.md updated with setup and deployment instructions

---

## Quick Reference

### Import Aliases

- `@/` → `src/` directory

### Common Imports

```typescript
import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import supabase from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
```

### Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run linter and tests
npm run lint        # Run ESLint
```

---

**Remember**: Always follow these instructions when generating or modifying code for this project.
