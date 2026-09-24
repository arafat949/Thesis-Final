import { useEffect, useRef, useState } from 'preact/hooks';
import {
  type HostedFieldsMessage,
  type InitMessage,
  type PaymentAmount,
  FieldType,
  generateNonce,
  isValidMessage,
} from '@amaderPay/web-sdk';
import {
  getWalletErrorMessage,
  sanitizeWalletInput,
  type WalletErrorField,
  type WalletField,
} from '../domain/wallet';
import {
  getFieldState,
  getOverallState,
  getPaymentMethodPayload,
} from './useHostedFields.helpers';
import {
  createPaymentConfirmResponseMessage,
  createPaymentIntentResponseMessage,
  postMessageToParent,
  postReadyMessage,
  postStateChangeMessage,
  type HostedFieldEventType,
} from '../infrastructure/hostedFieldsMessenger';
import {
  confirmPayment,
  createPaymentIntent,
  type PaymentApiConfig,
} from '../infrastructure/paymentApi';
import { formatInput, getErrorMessage, validateField } from '../utils';
import {
  type FieldErrors,
  type FieldValues,
  type PaymentMethodMode,
  type WalletAccountType,
  type WalletErrors,
  type WalletValues,
  INITIAL_FIELD_ERRORS,
  INITIAL_FIELD_VALUES,
  INITIAL_WALLET_ERRORS,
  INITIAL_WALLET_VALUES,
} from '../types';

export function useHostedFields() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodMode>('card');
  const [values, setValues] = useState<FieldValues>(INITIAL_FIELD_VALUES);
  const [errors, setErrors] = useState<FieldErrors>(INITIAL_FIELD_ERRORS);
  const [walletValues, setWalletValues] = useState<WalletValues>(
    INITIAL_WALLET_VALUES
  );
  const [walletErrors, setWalletErrors] = useState<WalletErrors>(
    INITIAL_WALLET_ERRORS
  );
  const [cardNumberPlaceholder, setCardNumberPlaceholder] =
    useState('Card number');

  const paymentMethodRef = useRef<PaymentMethodMode>('card');
  const valuesRef = useRef(INITIAL_FIELD_VALUES);
  const errorsRef = useRef(INITIAL_FIELD_ERRORS);
  const walletValuesRef = useRef(INITIAL_WALLET_VALUES);
  const walletErrorsRef = useRef(INITIAL_WALLET_ERRORS);
  const sessionIdRef = useRef<string | null>(null);
  const parentOriginRef = useRef<string | null>(null);
  const publicKeyRef = useRef<string | null>(null);
  const apiOriginRef = useRef('http://localhost:4400');

  const syncValues = (nextValues: FieldValues): void => {
    valuesRef.current = nextValues;
    setValues(nextValues);
  };

  const syncErrors = (nextErrors: FieldErrors): void => {
    errorsRef.current = nextErrors;
    setErrors(nextErrors);
  };

  const syncWalletValues = (nextValues: WalletValues): void => {
    walletValuesRef.current = nextValues;
    setWalletValues(nextValues);
  };

  const syncWalletErrors = (nextErrors: WalletErrors): void => {
    walletErrorsRef.current = nextErrors;
    setWalletErrors(nextErrors);
  };

  const postFieldStateChange = (
    fieldType: FieldType,
    eventType: HostedFieldEventType,
    nextValues: FieldValues = valuesRef.current,
    nextWalletValues: WalletValues = walletValuesRef.current,
    method: PaymentMethodMode = paymentMethodRef.current
  ): void => {
    postStateChangeMessage({
      sessionId: sessionIdRef.current,
      parentOrigin: parentOriginRef.current,
      fieldType,
      state: getFieldState(fieldType, nextValues, method, nextWalletValues),
      eventType,
    });
  };

  const postOverallStateChange = (
    method: PaymentMethodMode,
    eventType: HostedFieldEventType,
    nextValues: FieldValues = valuesRef.current,
    nextWalletValues: WalletValues = walletValuesRef.current
  ): void => {
    postStateChangeMessage({
      sessionId: sessionIdRef.current,
      parentOrigin: parentOriginRef.current,
      fieldType: FieldType.CardNumber,
      state: getOverallState(method, nextValues, nextWalletValues),
      eventType,
    });
  };

  const updateFieldError = (
    fieldType: FieldType,
    value: string,
    shouldShowError: boolean
  ): void => {
    const nextErrors: FieldErrors = {
      ...errorsRef.current,
      [fieldType]:
        shouldShowError && !validateField(fieldType, value)
          ? getErrorMessage(fieldType, value)
          : '',
    };

    syncErrors(nextErrors);
  };

  const getApiConfig = (): PaymentApiConfig | null => {
    if (!sessionIdRef.current || !parentOriginRef.current) {
      return null;
    }

    return {
      apiOrigin: apiOriginRef.current,
      publicKey: publicKeyRef.current || '',
      sessionId: sessionIdRef.current,
    };
  };

  const clearForm = (): void => {
    setPaymentMethod('card');
    paymentMethodRef.current = 'card';
    syncValues({ ...INITIAL_FIELD_VALUES });
    syncErrors({ ...INITIAL_FIELD_ERRORS });
    syncWalletValues({ ...INITIAL_WALLET_VALUES });
    syncWalletErrors({ ...INITIAL_WALLET_ERRORS });
    postOverallStateChange(
      'card',
      'change',
      INITIAL_FIELD_VALUES,
      INITIAL_WALLET_VALUES
    );
  };

  const handleInput = (fieldType: FieldType, rawValue: string): void => {
    const nextValues: FieldValues = {
      ...valuesRef.current,
      [fieldType]: formatInput(fieldType, rawValue),
    };

    syncValues(nextValues);
    updateFieldError(
      fieldType,
      nextValues[fieldType],
      Boolean(errorsRef.current[fieldType])
    );
    postFieldStateChange(fieldType, 'change', nextValues);
  };

  const setSelectedPaymentMethod = (method: PaymentMethodMode): void => {
    setPaymentMethod(method);
    paymentMethodRef.current = method;
    syncErrors({ ...INITIAL_FIELD_ERRORS });
    syncWalletErrors({ ...INITIAL_WALLET_ERRORS });
    postOverallStateChange(method, 'change');
  };

  const handleWalletInput = (field: WalletField, rawValue: string): void => {
    const nextValues: WalletValues = {
      ...walletValuesRef.current,
      [field]: sanitizeWalletInput(field, rawValue),
    };

    syncWalletValues(nextValues);

    if (walletErrorsRef.current[field as WalletErrorField]) {
      syncWalletErrors({
        ...walletErrorsRef.current,
        [field]: getWalletErrorMessage(field as WalletErrorField, nextValues),
      });
    }

    postOverallStateChange(
      paymentMethodRef.current,
      'change',
      valuesRef.current,
      nextValues
    );
  };

  const handleWalletBlur = (field: WalletErrorField): void => {
    syncWalletErrors({
      ...walletErrorsRef.current,
      [field]: getWalletErrorMessage(field, walletValuesRef.current),
    });
    postOverallStateChange(paymentMethodRef.current, 'blur');
  };

  const handleWalletFocus = (): void => {
    postOverallStateChange(paymentMethodRef.current, 'focus');
  };

  const handleWalletAccountTypeChange = (value: WalletAccountType): void => {
    const nextValues: WalletValues = {
      ...walletValuesRef.current,
      accountType: value,
    };

    syncWalletValues(nextValues);
    postOverallStateChange(
      paymentMethodRef.current,
      'change',
      valuesRef.current,
      nextValues
    );
  };

  const handleBlur = (fieldType: FieldType): void => {
    updateFieldError(fieldType, valuesRef.current[fieldType], true);
    postFieldStateChange(fieldType, 'blur');
  };

  const handleFocus = (fieldType: FieldType): void => {
    postFieldStateChange(fieldType, 'focus');
  };

  const handleInit = (message: InitMessage, origin: string): void => {
    sessionIdRef.current = message.sessionId;
    publicKeyRef.current = message.payload.publicKey;
    parentOriginRef.current = message.payload.parentOrigin || origin;

    if (message.payload.placeholder) {
      setCardNumberPlaceholder(message.payload.placeholder);
    }

    postReadyMessage(message.sessionId, parentOriginRef.current);
  };

  const handlePaymentIntent = async (payload: {
    amount: PaymentAmount;
    description?: string;
    mccCode?: string;
    idempotencyKey: string;
  }): Promise<void> => {
    const config = getApiConfig();
    if (!config) {
      return;
    }

    const parentOrigin = parentOriginRef.current;
    const idempotencyKey = payload.idempotencyKey || generateNonce();

    try {
      const response = await createPaymentIntent(config, {
        ...payload,
        idempotencyKey,
      });

      if (response.ok) {
        postMessageToParent(
          parentOrigin,
          createPaymentIntentResponseMessage(config.sessionId, {
            success: true,
            result: response.result,
            idempotencyKey,
          })
        );
        return;
      }

      postMessageToParent(
        parentOrigin,
        createPaymentIntentResponseMessage(config.sessionId, {
          success: false,
          error: {
            type: 'api_error',
            code: 'intent_failed',
            message: 'Intent failed',
          },
          idempotencyKey,
        })
      );
    } catch {
      postMessageToParent(
        parentOrigin,
        createPaymentIntentResponseMessage(config.sessionId, {
          success: false,
          error: {
            type: 'network_error',
            code: 'error',
            message: 'Failed to create payment intent',
          },
          idempotencyKey,
        })
      );
    }
  };

  const handlePaymentConfirm = async ({
    idempotencyKey,
    clientSecret,
    verificationCode,
  }: {
    idempotencyKey: string;
    clientSecret: string;
    verificationCode?: string;
  }): Promise<void> => {
    console.log('[payment-fields] handlePaymentConfirm START');
    console.log('[payment-fields] clientSecret:', clientSecret);
    console.log('[payment-fields] idempotencyKey:', idempotencyKey);

    const config = getApiConfig();

    console.log('[payment-fields] API config:', config);

    if (!config) {
      console.error('[payment-fields] API config is missing');

      if (sessionIdRef.current) {
        postMessageToParent(
          parentOriginRef.current,
          createPaymentConfirmResponseMessage(sessionIdRef.current, {
            success: false,
            error: {
              type: 'configuration_error',
              code: 'missing_api_config',
              message: 'Payment API configuration is missing',
            },
            idempotencyKey,
          })
        );
      }

      return;
    }

    const parentOrigin = parentOriginRef.current;
    const requestKey = idempotencyKey || generateNonce();

    try {
      console.log('[payment-fields] Sending CONFIRM API request...');
      console.log('[payment-fields] API URL:',
        `${config.apiOrigin}/v1/payments/intent/${clientSecret}/confirm`
      );

      const paymentMethod = getPaymentMethodPayload(
        paymentMethodRef.current,
        valuesRef.current,
        walletValuesRef.current
      );

      console.log('[payment-fields] payment method:', paymentMethod);

      const response = await confirmPayment(config, {
        clientSecret,
        verificationCode,
        idempotencyKey: requestKey,
        paymentMethod,
      });

      console.log('[payment-fields] CONFIRM API response:', response);

      if (response.ok) {
        console.log('[payment-fields] >>> Sending PAYMENT_CONFIRM_RESPONSE to parent');

        postMessageToParent(
          parentOrigin,
          createPaymentConfirmResponseMessage(config.sessionId, {
            success: true,
            result: response.result,
            idempotencyKey: requestKey,
          })
        );
        return;
      }

      postMessageToParent(
        parentOrigin,
        createPaymentConfirmResponseMessage(config.sessionId, {
          success: false,
          error: {
            type: 'api_error',
            code: 'confirm_failed',
            message: 'Confirm failed',
          },
          idempotencyKey: requestKey,
        })
      );
    } catch (error) {
      console.error('[payment-fields] CONFIRM API ERROR:', error);

      postMessageToParent(
        parentOrigin,
        createPaymentConfirmResponseMessage(config.sessionId, {
          success: false,
          error: {
            type: 'network_error',
            code: 'confirm_error',
            message: error instanceof Error
              ? error.message
              : 'Failed to confirm payment',
          },
          idempotencyKey: requestKey,
        })
      );
    }
  };

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent): void => {
      if (parentOriginRef.current && event.origin !== parentOriginRef.current) {
        return;
      }

      if (!isValidMessage(event.data)) {
        return;
      }

      if (
        sessionIdRef.current &&
        event.data.sessionId !== sessionIdRef.current
      ) {
        return;
      }

      const message = event.data as HostedFieldsMessage;

      switch (message.type) {
        case 'INIT':
          handleInit(message as InitMessage, event.origin);
          break;
        case 'PAYMENT_CONFIRM_REQUEST':
          console.log('[payment-fields] PAYMENT_CONFIRM_REQUEST received:', message.payload);
          void handlePaymentConfirm(message.payload);
          break;
        case 'PAYMENT_INTENT_REQUEST':
          handlePaymentIntent(message.payload);
          break;
        case 'CLEAR':
          clearForm();
          break;
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  return {
    paymentMethod,
    setSelectedPaymentMethod,
    values,
    errors,
    walletValues,
    walletErrors,
    cardNumberPlaceholder,
    handleInput,
    handleBlur,
    handleFocus,
    handleWalletInput,
    handleWalletBlur,
    handleWalletFocus,
    handleWalletAccountTypeChange,
  };
}
