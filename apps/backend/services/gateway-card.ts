import crypto from "crypto";
import type { Gateway, GatewayChargeRequest, GatewayChargeResult } from "./gateway";

// ─── Mock Card Gateway ───────────────────────────────────────
// Simulates a card processor (like SSLCOMMERZ / Stripe-style).
// Special card-last4 values trigger specific outcomes for testing.

const DECLINE_LAST4 = new Set(["0002", "9995"]);

export const cardGateway: Gateway = {
  name: "card",

  async charge(req: GatewayChargeRequest): Promise<GatewayChargeResult> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));

    const ref = `card_${crypto.randomBytes(8).toString("hex")}`;

    // Test-card decline logic (based on paymentMethod last4 stored in DB)
    if (DECLINE_LAST4.has(req.metadata?.cardLast4 as string)) {
      return { success: false, gatewayRef: ref, message: "Card declined" };
    }

    return { success: true, gatewayRef: ref, message: "Approved" };
  },
};
