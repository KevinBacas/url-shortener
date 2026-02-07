# URL Shortener

A modern, type-safe URL shortener built with Next.js 16, TypeScript, and Supabase. Create short links, track analytics, and manage your URLs with ease.

## Features

- ✨ **Shorten URLs** - Convert long URLs into short, shareable links
- 📊 **Click Tracking** - Monitor clicks with user agent and referrer data
- 🎨 **Modern UI** - Built with Shadcn UI and Tailwind CSS v4
- 🔒 **Type-Safe** - Full TypeScript with strict type checking
- 📝 **Comprehensive Logging** - Winston logger for debugging and monitoring
- 🧪 **Well-Tested** - Jest and React Testing Library for quality assurance

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **UI**: [Shadcn UI](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com)
- **Testing**: Jest + React Testing Library
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Environment variables configured (see below)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
cp .env.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Optional: Customize slug generation
CUSTOM_NANOID_ALPHABET=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
CUSTOM_NANOID_LENGTH=6
```

**⚠️ Important**: Keep `SUPABASE_SERVICE_KEY` secret! This key has admin privileges and should only be used in server-side code. Never expose it to the client.

4. Set up the database schema in Supabase:
```sql
-- short_links table
CREATE TABLE short_links (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- link_clicks table
CREATE TABLE link_clicks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  short_link_id BIGINT REFERENCES short_links(id),
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_short_links_slug ON short_links(slug);
CREATE INDEX idx_link_clicks_short_link_id ON link_clicks(short_link_id);
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Development

### Available Scripts

```bash
npm run dev          # Start development server (with Turbopack)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test            # Run linter and Jest tests
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── route.ts       # POST /api - Create short link
│   │   ├── [id]/         # GET /api/[id] - Redirect
│   │   └── analytics/    # GET /api/analytics - Analytics data
│   ├── analytics/         # Analytics page (Server Component)
│   │   ├── page.tsx      # Analytics Server Component
│   │   └── loading.tsx   # Loading state
│   ├── error.tsx          # Global error boundary
│   ├── not-found.tsx      # 404 page
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── ui/               # Shadcn UI components (DO NOT MODIFY)
│   ├── analytics-list.tsx # Analytics display (Client Component)
│   └── homepage-form.tsx # URL shortening form (Client Component)
├── lib/                  # Core utilities
│   ├── analytics.ts      # Analytics data fetching
│   ├── api-types.ts      # API response types
│   ├── env.ts            # Environment variable validation
│   ├── logger.ts         # Winston logger
│   └── utils.ts          # Helper functions
└── utils/                # Third-party integrations
    └── supabase/         # Supabase clients
        ├── client.ts     # Browser client (anon key)
        └── server.ts     # Server client (service key)
types/                    # Generated TypeScript definitions
└── database.types.ts    # Supabase generated types + aliases
```

## GitHub Copilot Integration

This project includes specialized GitHub Copilot agents to enhance your development experience:

### 🤖 Custom Agents

- **🗄️ Database Agent** - Supabase operations, schema design, query optimization
- **🔌 API Agent** - Next.js API routes, validation, error handling
- **🧪 Testing Agent** - Jest tests, mocking, coverage improvements
- **🐛 Debug Agent** - Troubleshooting, root cause analysis, bug fixes

See [`.github/agents/README.md`](.github/agents/README.md) for detailed usage instructions.

### 📋 Coding Standards

All development should follow the guidelines in [`.github/copilot-instructions.md`](.github/copilot-instructions.md), which includes:
- API route patterns
- Database operation standards
- Testing requirements
- Logging conventions
- Error handling practices

## Testing

The project uses Jest and React Testing Library for testing.

```bash
# Run all tests with linter
npm test

# Run only Jest
npx jest

# Watch mode
npx jest --watch

# Coverage report
npx jest --coverage
```

Tests are located alongside source files (`*.test.ts` or `*.test.tsx`).

## API Documentation

### POST /api
Create a shortened URL.

**Request:**
```json
{
  "url": "https://example.com/very/long/url"
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3000/abc123"
}
```

### GET /api/[slug]
Redirect to the original URL and track the click.

**Response:** HTTP 302 redirect or 404 if not found

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) | Yes | - |
| `SUPABASE_SERVICE_KEY` | Supabase service key (server-side only) | Yes | - |
| `CUSTOM_NANOID_ALPHABET` | Characters for slug generation | No | `0-9a-zA-Z` |
| `CUSTOM_NANOID_LENGTH` | Length of generated slugs | No | `6` |
| `NODE_ENV` | Environment mode | No | `development` |

**Security Note**: The `SUPABASE_SERVICE_KEY` has admin privileges and bypasses Row Level Security. It should:
- Only be used in server-side code (API routes, Server Components, Server Actions)
- Never be exposed to the client (no `NEXT_PUBLIC_` prefix)
- Be kept secret in production environments

## Deployment

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more options.

### Important: Database Setup

Don't forget to set up your Supabase tables before deploying!

## Contributing

1. Follow the coding standards in `.github/copilot-instructions.md`
2. Write tests for new features
3. Ensure all tests pass before committing
4. Run `npm run lint` to check for linting errors

## License

[MIT License](LICENSE)

---

Built with ❤️ using Next.js and Supabase
