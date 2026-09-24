import crypto from "crypto";
import type { Gateway, GatewayChargeRequest, GatewayChargeResult } from "./gateway";

// ─── Mock Nagad Gateway ──────────────────────────────────────
// Simulates Nagad payment API responses.

export const nagadGateway: Gateway = {
  name: "nagad",

  async charge(req: GatewayChargeRequest): Promise<GatewayChargeResult> {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

    const ref = `nagad_${crypto.randomBytes(8).toString("hex")}`;

    // Simulate: amounts over 50000 USD fail (Nagad limit)
    if (req.currency === "USD" && req.amount > 50000) {
      return { success: false, gatewayRef: ref, message: "Nagad: Transaction limit exceeded" };
    }

    return { success: true, gatewayRef: ref, message: "Nagad: Payment successful" };
  },
};
