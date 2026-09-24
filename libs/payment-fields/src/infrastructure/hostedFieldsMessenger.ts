import {
  type FieldState,
  type HostedFieldsMessage,
  type PaymentConfirmResponseMessage,
  type PaymentIntentResponseMessage,
  type ReadyMessage,
  type StateChangeMessage,
  createBaseMessage,
  FieldType,
} from '@amaderPay/web-sdk';

export type HostedFieldEventType = 'focus' | 'blur' | 'change';

type StateChangeArgs = {
  sessionId: string | null;
  parentOrigin: string | null;
  fieldType: FieldType;
  state: FieldState;
  eventType: HostedFieldEventType;
};

export function postMessageToParent(
  parentOrigin: string | null,
  message: HostedFieldsMessage
): void {
  if (!parentOrigin) {
    console.error(
      '[payment-fields] Cannot post message: parentOrigin is missing',
      message
    );
    return;
  }

  console.log(
    '[payment-fields] postMessage -> parent',
    {
      targetOrigin: parentOrigin,
      type: message.type,
      sessionId: message.sessionId,
      payload: message.payload,
    }
  );

  window.parent.postMessage(message, parentOrigin);
}

export function postReadyMessage(sessionId: string, parentOrigin: string): void {
  const message: ReadyMessage = {
    ...createBaseMessage('READY', sessionId),
    type: 'READY',
    payload: {
      fieldType: FieldType.CardNumber,
      capabilities: ['tokenize'],
    },
  };

  postMessageToParent(parentOrigin, message);
}

export function postStateChangeMessage(args: StateChangeArgs): void {
  if (!args.sessionId || !args.parentOrigin) {
    return;
  }

  const message: StateChangeMessage = {
    ...createBaseMessage('STATE_CHANGE', args.sessionId),
    type: 'STATE_CHANGE',
    payload: {
      fieldType: args.fieldType,
      state: args.state,
      eventType: args.eventType,
    },
  };

  postMessageToParent(args.parentOrigin, message);
}

export function createPaymentIntentResponseMessage(
  sessionId: string,
  payload: PaymentIntentResponseMessage['payload'],
): PaymentIntentResponseMessage {
  return {
    ...createBaseMessage('PAYMENT_INTENT_RESPONSE', sessionId),
    type: 'PAYMENT_INTENT_RESPONSE',
    payload,
  };
}

export function createPaymentConfirmResponseMessage(
  sessionId: string,
  payload: PaymentConfirmResponseMessage['payload'],
): PaymentConfirmResponseMessage {
  return {
    ...createBaseMessage('PAYMENT_CONFIRM_RESPONSE', sessionId),
    type: 'PAYMENT_CONFIRM_RESPONSE',
    payload,
  };
}
