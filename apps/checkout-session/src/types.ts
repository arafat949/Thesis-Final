export interface CheckoutSession {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  expiresAt: string;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  currency: string;
  amount: number;
  description?: string;
  status: string;
}

export interface PaymentReceipt {
  id: string;
  status: string;
  currency: string;
  amount: number;
  message?: string;
  gateway?: string;
  transactionRef?: string;
  description?: string;
}
