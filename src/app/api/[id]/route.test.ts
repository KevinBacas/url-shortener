jest.mock("@/lib/env", () => ({
  serverEnv: {
    supabaseUrl: "http://localhost:54321",
    supabaseAnonKey: "test-anon-key",
    supabaseServiceKey: "test-service-key",
  },
  clientEnv: {
    supabaseUrl: "http://localhost:54321",
    supabaseAnonKey: "test-anon-key",
  },
}));

jest.mock("@/utils/supabase/serverAdmin", () => ({
  __esModule: true,
  default: {
    from: (table: string) => {
      if (table === "link_clicks") {
        return {
          insert: () =>
            Promise.resolve({
              data: null,
              error: null,
            }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({
                data: {
                  id: 1,
                  slug: "abc123",
                  target_url: "https://example.com",
                },
                error: null,
              }),
          }),
        }),
      };
    },
  },
}));

import { GET } from "./route";
import logger from "@/lib/logger";

jest.spyOn(logger, "info").mockImplementation(() => logger);
jest.spyOn(logger, "error").mockImplementation(() => logger);
jest.spyOn(logger, "warn").mockImplementation(() => logger);

describe("GET /api/[id]", () => {
  it("returns 500 if db error", async () => {
    jest.resetModules();
    jest.doMock("@/utils/supabase/serverAdmin", () => ({
      __esModule: true,
      default: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: null, error: { message: "db error" } }),
            }),
          }),
        }),
      },
    }));
    const { GET: mockedGET } = await import("./route");
    const req = {
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "GET",
      url: "",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;
    const params = Promise.resolve({ id: "abc123" });
    const res = await mockedGET(req, { params });
    expect(res?.status).toBe(500);
  });

  it("returns 404 if not found", async () => {
    jest.resetModules();
    jest.doMock("@/utils/supabase/serverAdmin", () => ({
      __esModule: true,
      default: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
      },
    }));
    const { GET: mockedGET } = await import("./route");
    const req = {
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "GET",
      url: "",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;
    const params = Promise.resolve({ id: "notfound" });
    const res = await mockedGET(req, { params });
    expect(res?.status).toBe(404);
  });

  it("redirects if found", async () => {
    const req = {
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "GET",
      url: "",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;
    const params = Promise.resolve({ id: "abc123" });
    const res = await GET(req, { params });
    expect(res?.status).toBe(302);
    expect(res?.headers.get("Location")).toBe("https://example.com/");
  });
});
