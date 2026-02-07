jest.mock("nanoid", () => ({
  customAlphabet: () => () => "abc123",
}));

jest.mock("@/lib/env", () => ({
  serverEnv: {
    supabaseUrl: "http://localhost:54321",
    supabaseServiceKey: "test-service-key",
  },
  clientEnv: {
    supabaseUrl: "http://localhost:54321",
    supabaseAnonKey: "test-anon-key",
  },
  nanoidConfig: {
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    length: 6,
  },
}));

import { POST } from "./route";
import logger from "@/lib/logger";

jest.mock("@/utils/supabase/server", () => ({
  __esModule: true,
  default: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({
              data: null,
              error: null,
            }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { slug: "abc123", target_url: "https://example.com" },
              error: null,
            }),
        }),
      }),
    }),
  },
}));

jest.spyOn(logger, "info").mockImplementation(() => logger);
jest.spyOn(logger, "error").mockImplementation(() => logger);
jest.spyOn(logger, "warn").mockImplementation(() => logger);

describe("POST /api", () => {
  it("returns 400 if body is invalid", async () => {
    const req = {
      json: async () => {
        throw new Error("bad json");
      },
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "POST",
      url: "",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 if url is missing", async () => {
    const req = {
      json: async () => ({}),
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "POST",
      url: "",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 if url format is invalid", async () => {
    const req = {
      json: async () => ({ url: "not-a-valid-url" }),
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "POST",
      url: "",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid URL format");
  });

  it("returns 200 and short link if url is provided", async () => {
    const req = {
      json: async () => ({ url: "https://example.com" }),
      cookies: {},
      nextUrl: {},
      page: {},
      ua: "",
      method: "POST",
      url: "http://localhost/api",
      headers: new Headers(),
      clone: () => req,
    } as unknown as import("next/server").NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.text();
    expect(body).toContain("abc123");
  });
});
