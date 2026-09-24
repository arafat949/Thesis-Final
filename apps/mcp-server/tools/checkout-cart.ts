// ─── Tool: checkout_cart ──────────────────────────────────────
// Creates a SECURE checkout session for the current cart.
// Returns a URL that the user opens in a browser to pay.
// The agent NEVER sees payment credentials (PCI compliant).

import { z } from "zod";
import { apiCall } from "../api-client.js";

export const name = "checkout_cart";

export const description =
  "Create a secure checkout session for the shopping cart. Returns a checkout URL " +
  "that the user opens in their browser to complete payment via hosted fields. " +
  "The agent never handles payment credentials. After the user pays, use " +
  "get_payment_status to verify the payment was successful.";

export const schema = z.object({
  description: z
    .string()
    .optional()
    .describe("Optional description for the checkout (e.g. 'Weekly grocery order')"),
});

interface SessionResponse {
  id: string;
  url: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  expiresAt: string;
}

export async function execute(args: z.infer<typeof schema>) {
  const cartRes = await apiCall("GET", "/v1/cart");
  if (!cartRes.ok) return { error: "Failed to fetch cart", details: cartRes.data };

  const cart = cartRes.data as any;
  if (!cart.items || cart.items.length === 0) {
    return { error: "Cart is empty. Add products before checkout." };
  }

  const sessionRes = await apiCall<SessionResponse>("POST", "/v1/checkout/sessions", {
    cartId: cart.id,
    description: args.description,
  });

  if (!sessionRes.ok) {
    return { error: "Failed to create checkout session", details: sessionRes.data };
  }

  const session = sessionRes.data;

  return {
    success: true,
    message: "Checkout session created. Share the URL with the user to complete payment.",
    session: {
      id: session.id,
      checkoutUrl: session.url,
      amount: session.amount,
      currency: session.currency,
      description: session.description,
      expiresAt: session.expiresAt,
    },
    cart: {
      itemCount: cart.itemCount,
      total: cart.total,
      items: cart.items,
    },
  };
}
