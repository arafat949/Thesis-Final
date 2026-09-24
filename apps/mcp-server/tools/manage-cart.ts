// ─── Tool: manage_cart ────────────────────────────────────────
// Add/remove items from the shopping cart, or view cart contents.

import { z } from "zod";
import { apiCall } from "../api-client.js";

export const name = "manage_cart";

export const description =
  "Manage the shopping cart: view current cart, add products, remove products, or clear the cart. " +
  "Use action='view' to see cart contents, 'add' to add a product, 'remove' to remove a product, 'clear' to empty the cart.";

export const schema = z.object({
  action: z
    .enum(["view", "add", "remove", "clear"])
    .describe("Cart action: view, add, remove, or clear"),
  product_id: z
    .string()
    .optional()
    .describe("Product ID (required for add/remove)"),
  quantity: z
    .number()
    .optional()
    .describe("Quantity to add (default: 1, only for 'add' action)"),
});

export async function execute(args: z.infer<typeof schema>) {
  switch (args.action) {
    case "view": {
      const res = await apiCall("GET", "/v1/cart");
      if (!res.ok) return { error: "Failed to fetch cart", details: res.data };
      return res.data;
    }

    case "add": {
      if (!args.product_id) return { error: "product_id is required for 'add' action" };
      const res = await apiCall("POST", "/v1/cart/add", {
        productId: args.product_id,
        quantity: args.quantity || 1,
      });
      if (!res.ok) return { error: "Failed to add to cart", details: res.data };
      return res.data;
    }

    case "remove": {
      if (!args.product_id) return { error: "product_id is required for 'remove' action" };
      const res = await apiCall("POST", "/v1/cart/remove", { productId: args.product_id });
      if (!res.ok) return { error: "Failed to remove from cart", details: res.data };
      return res.data;
    }

    case "clear": {
      const res = await apiCall("POST", "/v1/cart/clear");
      if (!res.ok) return { error: "Failed to clear cart", details: res.data };
      return res.data;
    }

    default:
      return { error: "Invalid action. Use: view, add, remove, or clear" };
  }
}
