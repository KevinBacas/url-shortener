import { GET } from "./route";
import logger from "@/lib/logger";

const mockShortLinksWithClicks = [
  {
    id: 1,
    slug: "abc123",
    target_url: "https://example.com",
    user_id: "user-1",
    created_at: "2026-02-01T10:00:00Z",
    clicks: [
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
    ],
  },
  {
    id: 2,
    slug: "xyz789",
    target_url: "https://test.com",
    user_id: "user-1",
    created_at: "2026-02-05T15:30:00Z",
    clicks: [],
  },
];

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(async () => ({
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
    from: jest.fn(() => ({
      select: () => ({
        order: () =>
          Promise.resolve({
            data: mockShortLinksWithClicks,
            error: null,
          }),
      }),
    })),
  })),
}));

jest.spyOn(logger, "info").mockImplementation(() => logger);
jest.spyOn(logger, "error").mockImplementation(() => logger);
jest.spyOn(logger, "warn").mockImplementation(() => logger);

describe("GET /api/analytics", () => {
  it("returns analytics data with click counts", async () => {
    const res = await GET();
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
    jest.resetModules();
    jest.doMock("@/utils/supabase/server", () => ({
      createClient: jest.fn(async () => ({
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
        from: () => ({
          select: () => ({
            order: () =>
              Promise.resolve({
                data: [],
                error: null,
              }),
          }),
        }),
      })),
    }));

    const { GET: mockedGET } = await import("./route");
    const res = await mockedGET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns 500 if database error occurs", async () => {
    jest.resetModules();
    jest.doMock("@/utils/supabase/server", () => ({
      createClient: jest.fn(async () => ({
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
        from: () => ({
          select: () => ({
            order: () =>
              Promise.resolve({
                data: null,
                error: { message: "Database connection failed" },
              }),
          }),
        }),
      })),
    }));

    const { GET: mockedGET } = await import("./route");
    const res = await mockedGET();
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Internal server error");
  });
});
