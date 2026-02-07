import { GET } from "./route";
import logger from "@/lib/logger";

const mockShortLinks = [
  {
    id: 1,
    slug: "abc123",
    target_url: "https://example.com",
    user_id: "user-1",
    created_at: "2026-02-01T10:00:00Z",
  },
  {
    id: 2,
    slug: "xyz789",
    target_url: "https://test.com",
    user_id: "user-1",
    created_at: "2026-02-05T15:30:00Z",
  },
];

const mockClicks = [
  {
    id: 1,
    short_link_id: 1,
    clicked_at: "2026-02-02T12:00:00Z",
    user_agent: "Mozilla/5.0",
    referrer: "https://google.com",
    created_at: "2026-02-02T12:00:00Z",
  },
  {
    id: 2,
    short_link_id: 1,
    clicked_at: "2026-02-03T14:00:00Z",
    user_agent: "Chrome/91.0",
    referrer: null,
    created_at: "2026-02-03T14:00:00Z",
  },
];

jest.mock("@/utils/supabase/client", () => ({
  from: jest.fn((table: string) => {
    if (table === "short_links") {
      return {
        select: () => ({
          order: () => ({
            data: mockShortLinks,
            error: null,
          }),
        }),
      };
    }
    if (table === "link_clicks") {
      return {
        select: () => ({
          in: () => ({
            order: () => ({
              data: mockClicks,
              error: null,
            }),
          }),
        }),
      };
    }
    return {};
  }),
}));

jest.spyOn(logger, "info").mockImplementation(() => logger);
jest.spyOn(logger, "error").mockImplementation(() => logger);
jest.spyOn(logger, "warn").mockImplementation(() => logger);

describe("GET /api/analytics", () => {
  it("returns analytics data with click counts", async () => {
    const req = {
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "GET",
      url: "http://localhost/api/analytics",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(2);

    // First link should have 2 clicks
    expect(data[0]).toMatchObject({
      slug: "abc123",
      target_url: "https://example.com",
      click_count: 2,
    });
    expect(data[0].clicks).toHaveLength(2);

    // Second link should have 0 clicks
    expect(data[1]).toMatchObject({
      slug: "xyz789",
      target_url: "https://test.com",
      click_count: 0,
    });
    expect(data[1].clicks).toHaveLength(0);
  });

  it("returns empty array when no links exist", async () => {
    const supabase = require("@/utils/supabase/client");
    supabase.from = jest.fn(() => ({
      select: () => ({
        order: () => ({
          data: [],
          error: null,
        }),
      }),
    }));

    const req = {
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "GET",
      url: "http://localhost/api/analytics",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns 500 if database error occurs when fetching links", async () => {
    const supabase = require("@/utils/supabase/client");
    supabase.from = jest.fn(() => ({
      select: () => ({
        order: () => ({
          data: null,
          error: { message: "Database connection failed" },
        }),
      }),
    }));

    const req = {
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "GET",
      url: "http://localhost/api/analytics",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;

    const res = await GET(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Failed to fetch analytics data");
  });

  it("returns 500 if database error occurs when fetching clicks", async () => {
    const supabase = require("@/utils/supabase/client");
    supabase.from = jest.fn((table: string) => {
      if (table === "short_links") {
        return {
          select: () => ({
            order: () => ({
              data: mockShortLinks,
              error: null,
            }),
          }),
        };
      }
      if (table === "link_clicks") {
        return {
          select: () => ({
            in: () => ({
              order: () => ({
                data: null,
                error: { message: "Failed to fetch clicks" },
              }),
            }),
          }),
        };
      }
      return {};
    });

    const req = {
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "GET",
      url: "http://localhost/api/analytics",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;

    const res = await GET(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Failed to fetch click data");
  });
});
