import crypto from "crypto";
import type { Gateway, GatewayChargeRequest, GatewayChargeResult } from "./gateway";

// ─── Mock bKash Gateway ──────────────────────────────────────
// Simulates bKash payment API responses.

export const bkashGateway: Gateway = {
  name: "bkash",

  async charge(req: GatewayChargeRequest): Promise<GatewayChargeResult> {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

    const ref = `bkash_${crypto.randomBytes(8).toString("hex")}`;

    // Simulate: amounts over 25000 USD fail (bKash daily limit)
    if (req.currency === "USD" && req.amount > 25000) {
      return { success: false, gatewayRef: ref, message: "bKash: Daily limit exceeded" };
    }

    return { success: true, gatewayRef: ref, message: "bKash: Payment successful" };
  },
};
