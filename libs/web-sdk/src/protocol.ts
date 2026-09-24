/**
 * halalpay Web SDK - Message Protocol
 */

import type { FieldType, FieldState, PaymentConfirmResult, PaymentAmount, PaymentIntentResult } from './types';

export type MessageType =
  | 'INIT'
  | 'CLEAR'
  | 'READY'
  | 'STATE_CHANGE'
  | 'PAYMENT_CONFIRM_REQUEST'
  | 'PAYMENT_CONFIRM_RESPONSE'
  | 'PAYMENT_INTENT_REQUEST'
  | 'PAYMENT_INTENT_RESPONSE';

export interface BaseMessage {
  type: MessageType;
  sessionId: string;
  nonce: string;
  timestamp: number;
  version: string;
}

export interface InitMessage extends BaseMessage {
  type: 'INIT';
  payload: {
    fieldType: FieldType;
    publicKey: string;
    environment: string;
    placeholder?: string;
    parentOrigin: string;
  };
}

export interface ClearMessage extends BaseMessage {
  type: 'CLEAR';
}

export interface ReadyMessage extends BaseMessage {
  type: 'READY';
  payload: { fieldType: FieldType; capabilities: string[] };
}

export interface StateChangeMessage extends BaseMessage {
  type: 'STATE_CHANGE';
  payload: {
    fieldType: FieldType;
    state: FieldState;
    eventType: 'focus' | 'blur' | 'change';
  };
}

export interface PaymentConfirmRequestMessage extends BaseMessage {
  type: 'PAYMENT_CONFIRM_REQUEST';
  payload: {
    clientSecret: string;
    verificationCode?: string;
    idempotencyKey: string;
  }
}

export interface PaymentConfirmResponseMessage extends BaseMessage {
  type: 'PAYMENT_CONFIRM_RESPONSE';
  payload: {
    success: boolean;
    result?: PaymentConfirmResult;
    error?: { type: string; code: string; message: string };
    idempotencyKey: string;
  };
}

export interface PaymentIntentRequestMessage extends BaseMessage {
  type: 'PAYMENT_INTENT_REQUEST';
  payload: {
    amount: PaymentAmount;
    description?: string;
    mccCode?: string;
    idempotencyKey: string;
  };
}

export interface PaymentIntentResponseMessage extends BaseMessage {
  type: 'PAYMENT_INTENT_RESPONSE';
  payload: {
    success: boolean;
    result?: PaymentIntentResult;
    error?: { type: string; code: string; message: string };
    idempotencyKey: string;
  };
}

export type HostedFieldsMessage =
  | InitMessage
  | ClearMessage
  | ReadyMessage
  | StateChangeMessage
  | PaymentConfirmRequestMessage
  | PaymentConfirmResponseMessage
  | PaymentIntentRequestMessage
  | PaymentIntentResponseMessage

export const PROTOCOL_VERSION = '1.0.0';

export function generateNonce(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2);
}

export function generateSessionId(): string {
  return `sess_${generateNonce()}`;
}

export function createBaseMessage(type: MessageType, sessionId: string): BaseMessage {
  return {
    type,
    sessionId,
    nonce: generateNonce(),
    timestamp: Date.now(),
    version: PROTOCOL_VERSION,
  };
}

export function isValidMessage(data: unknown): data is HostedFieldsMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return (
    typeof msg.type === 'string' &&
    typeof msg.sessionId === 'string' &&
    typeof msg.nonce === 'string' &&
    typeof msg.timestamp === 'number' &&
    typeof msg.version === 'string'
  );
}

export function isValidSessionMessage(data: unknown, expectedSessionId: string): data is HostedFieldsMessage {
  return isValidMessage(data) && data.sessionId === expectedSessionId;
}
