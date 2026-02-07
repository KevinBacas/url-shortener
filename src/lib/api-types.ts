import type { ShortLink, LinkClick } from "@/types/database.types";

/**
 * API Response Types
 * These types define the structure of API responses for client-side consumption
 */

/**
 * Response from POST /api - Create short link
 */
export interface CreateLinkResponse extends ShortLink {
  shortUrl: string;
}

/**
 * Response from GET /api/analytics - Get analytics data
 */
export interface LinkWithClicksResponse extends ShortLink {
  click_count: number;
  clicks: LinkClick[];
}

export type AnalyticsResponse = LinkWithClicksResponse[];

/**
 * Error response format
 */
export interface ApiErrorResponse {
  error: string;
}
