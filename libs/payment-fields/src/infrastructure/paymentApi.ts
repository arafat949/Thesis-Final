import type { PaymentAmount, PaymentConfirmResult, PaymentIntentResult } from '@amaderPay/web-sdk';

export type PaymentApiConfig = {
  apiOrigin: string;
  publicKey: string;
  sessionId: string;
};

export type PaymentIntentInput = {
  amount: PaymentAmount;
  description?: string;
  mccCode?: string;
  idempotencyKey: string;
};

export type PaymentConfirmInput = {
  clientSecret: string;
  verificationCode?: string;
  idempotencyKey: string;
  paymentMethod: Record<string, unknown>;
};

type PaymentApiSuccessResult<TResult> = {
  ok: true;
  result: TResult;
};

type PaymentApiFailureResult = {
  ok: false;
  result: Record<string, unknown>;
};

type PaymentApiResult<TResult> = PaymentApiSuccessResult<TResult> | PaymentApiFailureResult;

async function readJson<TResult>(response: Response, fallback: TResult): Promise<TResult> {
  try {
    const result = await response.json();
    return typeof result === 'object' && result !== null ? (result as TResult) : fallback;
  } catch {
    return fallback;
  }
}

export async function createPaymentIntent(
  config: PaymentApiConfig,
  payload: PaymentIntentInput,
): Promise<PaymentApiResult<PaymentIntentResult>> {
  const response = await fetch(`${config.apiOrigin}/v1/payments/intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.publicKey}`,
      'X-Session-Id': config.sessionId,
      'X-Idempotency-Key': payload.idempotencyKey,
    },
    body: JSON.stringify({
      amount: payload.amount.value,
      currency: payload.amount.currency,
      description: payload.description,
      mccCode: payload.mccCode,
    }),
  });

  if (response.ok) {
    return {
      ok: true,
      result: await readJson<PaymentIntentResult>(response, {
        id: '',
        merchantId: '',
        clientSecret: '',
        currency: '',
        amount: 0,
        status: '',
        createdAt: '',
      }),
    };
  }

  return {
    ok: false,
    result: await readJson<Record<string, unknown>>(response, {}),
  };
}

export async function confirmPayment(
  config: PaymentApiConfig,
  payload: PaymentConfirmInput,
): Promise<PaymentApiResult<PaymentConfirmResult>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let response: Response;

  try {
    response = await fetch(`${config.apiOrigin}/v1/payments/intent/${payload.clientSecret}/confirm`, {
      method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.publicKey}`,
      'X-Session-Id': config.sessionId,
      'X-Idempotency-Key': payload.idempotencyKey,
    },
      body: JSON.stringify({
        clientSecret: payload.clientSecret,
        verificationCode: payload.verificationCode,
        paymentMethod: payload.paymentMethod,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (response.ok) {
    return {
      ok: true,
      result: await readJson<PaymentConfirmResult>(response, {
        id: '',
        status: '',
      }),
    };
  }

  return {
    ok: false,
    result: await readJson<Record<string, unknown>>(response, {}),
  };
}
