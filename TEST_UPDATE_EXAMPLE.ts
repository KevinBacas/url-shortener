// Example: How to Update Tests for Authentication
// This shows the pattern for updating existing tests to work with the new auth system

import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock the Supabase server client
jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: "test-user-id",
            email: "test@example.com",
          },
        },
        error: null,
      }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: 1,
        slug: "abc123",
        target_url: "https://example.com",
        user_id: "test-user-id",
        created_at: new Date().toISOString(),
      },
      error: null,
    }),
  }),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("POST /api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    // Override the mock for this specific test
    const { createClient } = require("@/utils/supabase/server");
    createClient.mockResolvedValueOnce({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("Not authenticated"),
        }),
      },
    });

    const req = new NextRequest("http://localhost:3000/api", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Authentication required");
  });

  it("returns 400 if body is invalid", async () => {
    const req = new NextRequest("http://localhost:3000/api", {
      method: "POST",
      body: "invalid json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 if url is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toBe("URL is required");
  });

  it("returns 400 if url format is invalid", async () => {
    const req = new NextRequest("http://localhost:3000/api", {
      method: "POST",
      body: JSON.stringify({ url: "not-a-valid-url" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("Invalid URL format");
  });

  it("returns 201 and creates short link for authenticated user", async () => {
    const req = new NextRequest("http://localhost:3000/api", {
      method: "POST",
      body: JSON.stringify({ url: "https://example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.slug).toBeDefined();
    expect(body.target_url).toBe("https://example.com");
    expect(body.user_id).toBe("test-user-id");
    expect(body.shortUrl).toContain("/api/");
  });
});

// Key Changes from Original Tests:
// 1. Mock createClient as async function returning a client
// 2. Mock getUser() to return authenticated user by default
// 3. Add test for 401 (unauthenticated access)
// 4. Override auth mock for specific unauthenticated tests
// 5. Expect user_id to be "test-user-id" instead of hardcoded UUID
