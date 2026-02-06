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
│   ├── api/         # API endpoints (POST /api, GET /api/[id])
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Homepage
├── components/      # React components
│   ├── ui/         # Shadcn UI components (DO NOT MODIFY)
│   └── *.tsx       # Custom components
├── lib/            # Core utilities
│   ├── logger.ts   # Winston logger configuration
│   └── utils.ts    # Helper functions
└── utils/          # App-specific utilities
    └── supabase/   # Supabase client configuration
types/              # TypeScript definitions
└── database.types.ts  # Supabase generated types
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

### Type Usage

- Always use types from `types/database.types.ts`
- Use `Database['public']['Tables']['table_name']['Row']` for row types
- Use `Database['public']['Tables']['table_name']['Insert']` for insert operations

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

**Example Pattern:**

```typescript
import { NextRequest } from "next/server";
import logger from "@/lib/logger";
import supabase from "@/utils/supabase/client";

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
- Read configuration from environment variables:
  - `CUSTOM_NANOID_ALPHABET` (default: alphanumeric)
  - `CUSTOM_NANOID_LENGTH` (default: 6)

**Pattern:**

```typescript
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  process.env.CUSTOM_NANOID_ALPHABET ||
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  parseInt(process.env.CUSTOM_NANOID_LENGTH ?? "6"),
);
const slug = nanoid();
```

### Client Components

- Always use `"use client"` directive at the top of files with hooks or browser APIs
- Use React hooks appropriately (useState, useEffect, etc.)
- Handle loading and error states properly
- Use the `sonner` toast library for user notifications

### Supabase Integration

- Import Supabase client from `@/utils/supabase/client`
- Always handle errors from Supabase operations
- Use the `.select()` method to return inserted/updated data
- Use `.single()` when expecting one result

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
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `CUSTOM_NANOID_ALPHABET`: Custom alphabet for slug generation (optional)
- `CUSTOM_NANOID_LENGTH`: Length of generated slugs (optional, default: 6)
- `NODE_ENV`: Environment mode (development/production)

## Git Workflow

- Write meaningful commit messages
- Ensure tests pass before pushing
- Run linter before committing: `npm run lint`
- Keep commits focused and atomic

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
