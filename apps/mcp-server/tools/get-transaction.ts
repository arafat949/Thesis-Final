// ─── Tool: get_transaction ────────────────────────────────────
// Retrieves the current status of a transaction.

import { z } from "zod";
import { apiCall } from "../api-client.js";

export const name = "get_transaction";

export const description =
  "Look up a transaction by ID and return its current status, " +
  "gateway, amount, and settlement details.";

export const schema = z.object({
  transaction_id: z
    .string()
    .describe("The transaction ID to look up"),
});

export async function execute(args: z.infer<typeof schema>) {
  const res = await apiCall("GET", `/v1/payments/${encodeURIComponent(args.transaction_id)}`);

  if (!res.ok) {
    return {
      error: "Transaction not found",
      status: res.status,
      details: res.data,
    };
  }

  return res.data;
}
