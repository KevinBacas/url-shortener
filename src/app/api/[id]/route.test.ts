import { GET } from "./route";
import logger from "@/lib/logger";

jest.mock("@/utils/supabase/client", () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => ({
          data: { slug: "abc123", target_url: "https://example.com" },
          error: null,
        }),
      }),
    }),
  }),
}));

jest.spyOn(logger, "info").mockImplementation(() => logger);
jest.spyOn(logger, "error").mockImplementation(() => logger);
jest.spyOn(logger, "warn").mockImplementation(() => logger);

describe("GET /api/[id]", () => {
  it("returns 302 if db error", async () => {
    jest.mock("@/utils/supabase/client", () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: { message: "db error" } }),
          }),
        }),
      }),
    }));
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
  });

  it("returns 302 if not found", async () => {
    jest.mock("@/utils/supabase/client", () => ({
      from: () => ({
        select: () => ({
          eq: () => ({ single: () => ({ data: null, error: null }) }),
        }),
      }),
    }));
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
    const res = await GET(req, { params });
    expect(res?.status).toBe(302);
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
