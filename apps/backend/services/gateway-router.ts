import type { Gateway, GatewayChargeRequest, GatewayChargeResult } from "./gateway";
import { cardGateway } from "./gateway-card";
import { bkashGateway } from "./gateway-bkash";
import { nagadGateway } from "./gateway-nagad";

// ─── Gateway Router ──────────────────────────────────────────
// Resolves the correct gateway implementation based on payment type.

const gateways: Record<string, Gateway> = {
  card: cardGateway,
  bkash: bkashGateway,
  nagad: nagadGateway,
};

export function getGateway(type: string): Gateway | undefined {
  return gateways[type];
}

export function listGateways(): string[] {
  return Object.keys(gateways);
}

export async function routeCharge(
  type: string,
  req: GatewayChargeRequest
): Promise<GatewayChargeResult> {
  const gw = getGateway(type);
  if (!gw) {
    return { success: false, gatewayRef: "", message: `Unknown gateway: ${type}` };
  }
  return gw.charge(req);
}
