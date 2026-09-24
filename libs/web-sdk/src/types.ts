export type Environment = 'sandbox' | 'production';

export interface halalpayConfig {
  publicKey: string;
  environment: Environment;
  iframeOrigin?: string;
  apiOrigin?: string;
}

export type CardData = {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
};

export enum FieldType {
  CardNumber = 'cardNumber',
  ExpirationDate = 'expirationDate',
  Cvv = 'cvv',
}

export interface CreateFieldsOptions {
  selector: string;
}

export interface FieldState {
  isEmpty: boolean;
  isValid: boolean;
}

export type FieldEventType = 'ready' | 'change' | 'focus' | 'blur';

export interface FieldChangeEvent {
  field: FieldType;
  type: FieldEventType;
  state: FieldState;
}

export interface FieldsEventCallback {
  (event: FieldChangeEvent): void;
}

export interface PaymentAmount{
  currency: string;
  value: number;
}

export interface PaymentConfirmResult {
  id: string;
  status: string;
  gateway?: string;
  message?: string;
  transactionRef?: string;
}

export interface PaymentIntentResult {
  id: string;
  merchantId: string;
  clientSecret: string;
  currency: string;
  amount: number;
  status: string;
  description?: string;
  mccCode?: string;
  createdAt: string;
}

export interface HostedFieldsInstance {
  create(options: CreateFieldsOptions): Promise<void>;
  on(event: FieldEventType | 'all', callback: FieldsEventCallback): void;
  PaymentConfirm(clientSecret: string, verificationCode?: string): Promise<PaymentConfirmResult>;
  PaymentIntent(amount: PaymentAmount, description?: string, mccCode?: string): Promise<PaymentIntentResult>;
  clear(): void;
}

export interface FieldInstance {
  iframe: HTMLIFrameElement;
  container: HTMLElement;
  state: FieldState;
  ready: boolean;
}
