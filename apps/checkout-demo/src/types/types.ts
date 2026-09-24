export interface PaymentIntentData {
  id: string;
  clientSecret: string;
  currency: string;
  amount: number;
  description?: string;
  status: string;
}

export interface ChargeResult {
  id: string;
  status: string;
  message?: string;
  currency?: string;
  amount?: number;
  value?: number;
  gateway?: string;
  gatewayRef?: string;
  transactionRef?: string;
  description?: string;
}

export interface OrderSummaryProps {
  productName: string;
  amount: number;
  orderLabel: string;
}
