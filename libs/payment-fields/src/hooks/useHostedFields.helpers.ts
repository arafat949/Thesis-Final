import { type FieldState, FieldType } from '@amaderPay/web-sdk';
import { buildWalletPaymentMethod, getWalletState } from '../domain/wallet';
import { normalizeCardData, validateField } from '../utils';
import type { FieldValues, PaymentMethodMode, WalletValues } from '../types';

export function getFieldState(
  fieldType: FieldType,
  values: FieldValues,
  paymentMethod: PaymentMethodMode,
  walletValues: WalletValues,
): FieldState {
  if (fieldType === FieldType.CardNumber && paymentMethod !== 'card') {
    return getWalletState(walletValues);
  }

  const value = values[fieldType];

  return {
    isEmpty: value.trim().length === 0,
    isValid: validateField(fieldType, value),
  };
}

export function getOverallState(
  paymentMethod: PaymentMethodMode,
  values: FieldValues,
  walletValues: WalletValues,
): FieldState {
  if (paymentMethod === 'card') {
    return getFieldState(FieldType.CardNumber, values, paymentMethod, walletValues);
  }

  return getWalletState(walletValues);
}

export function getPaymentMethodPayload(
  paymentMethod: PaymentMethodMode,
  values: FieldValues,
  walletValues: WalletValues,
): Record<string, unknown> {
  if (paymentMethod === 'card') {
    return normalizeCardData(values);
  }

  return buildWalletPaymentMethod(paymentMethod, walletValues);
}
