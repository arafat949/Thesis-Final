// ─── Gateway interface ────────────────────────────────────────
// Every gateway (card, bkash, nagad) implements this contract.

export interface GatewayChargeRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  metadata?: Record<string, unknown>;
}

export interface GatewayChargeResult {
  success: boolean;
  gatewayRef: string;
  message: string;
}

export interface Gateway {
  name: string;
  charge(req: GatewayChargeRequest): Promise<GatewayChargeResult>;
}
