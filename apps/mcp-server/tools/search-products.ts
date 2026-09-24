// ─── Tool: search_products ────────────────────────────────────
// Search, filter, and browse the product catalog.

import { z } from "zod";
import { apiCall } from "../api-client.js";

export const name = "search_products";

export const description =
  "Search the product catalog by keyword, category, price range, or sort order. " +
  "Returns matching products with name, image (imageUrl), price, rating, stock, and description. " +
  "Categories: grocery, electronics, clothing, books, home.";

export const schema = z.object({
  query: z
    .string()
    .optional()
    .describe("Search keyword (matches name, description, brand, tags)"),
  category: z
    .string()
    .optional()
    .describe("Filter by category: grocery, electronics, clothing, books, home"),
  min_price: z
    .number()
    .optional()
    .describe("Minimum price in USD"),
  max_price: z
    .number()
    .optional()
    .describe("Maximum price in USD"),
  sort_by: z
    .enum(["price_asc", "price_desc", "rating", "name"])
    .optional()
    .describe("Sort results: price_asc, price_desc, rating, or name"),
  limit: z
    .number()
    .optional()
    .describe("Max results to return (default 20, max 50)"),
});

export async function execute(args: z.infer<typeof schema>) {
  const params = new URLSearchParams();
  if (args.query) params.set("q", args.query);
  if (args.category) params.set("category", args.category);
  if (args.min_price) params.set("minPrice", String(args.min_price));
  if (args.max_price) params.set("maxPrice", String(args.max_price));
  if (args.sort_by) params.set("sortBy", args.sort_by);
  if (args.limit) params.set("limit", String(args.limit));

  const qs = params.toString();
  const res = await apiCall("GET", `/v1/products/search${qs ? `?${qs}` : ""}`);

  if (!res.ok) {
    return { error: "Failed to search products", status: res.status, details: res.data };
  }

  return res.data;
}
