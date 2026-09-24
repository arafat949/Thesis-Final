// ─── Tool: get_payment_status ─────────────────────────────────
// Checks whether a checkout session has been completed.
// The agent calls this after sharing the checkout URL with the user.

import { z } from "zod";
import { apiCall } from "../api-client.js";

export const name = "get_payment_status";

export const description =
  "Check the payment status of a checkout session. Use this after sharing " +
  "a checkout URL with the user to verify if they have completed the payment. " +
  "Returns the session status (pending, completed, or expired) and transaction details.";

export const schema = z.object({
  session_id: z
    .string()
    .describe("The checkout session ID returned by checkout_cart"),
});

interface SessionResponse {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  transactionId: string | null;
  expiresAt: string;
  createdAt: string;
}

export async function execute(args: z.infer<typeof schema>) {
  const res = await apiCall<SessionResponse>("GET", `/v1/checkout/sessions/${args.session_id}`);

  if (!res.ok) {
    return { error: "Failed to fetch session status", status: res.status, details: res.data };
  }

  const session = res.data;

  if (session.status === "completed" && session.transactionId) {
    const txRes = await apiCall("GET", `/v1/payments/${session.transactionId}`);
    return {
      status: "completed",
      message: "Payment successful! The user has completed checkout.",
      session: {
        id: session.id,
        amount: session.amount,
        currency: session.currency,
        description: session.description,
      },
      transaction: txRes.ok ? txRes.data : { id: session.transactionId },
    };
  }

  if (session.status === "expired") {
    return {
      status: "expired",
      message: "Checkout session has expired. Create a new session to retry.",
      session: { id: session.id, expiresAt: session.expiresAt },
    };
  }

  return {
    status: "pending",
    message: "Waiting for the user to complete payment in the browser.",
    session: {
      id: session.id,
      amount: session.amount,
      currency: session.currency,
      description: session.description,
      expiresAt: session.expiresAt,
    },
  };
}
