import type { PaymentMethodMode, WalletErrors, WalletValues } from '../types';

export type WalletField = keyof WalletValues;
export type WalletErrorField = keyof WalletErrors;
export type WalletState = {
  isEmpty: boolean;
  isValid: boolean;
};

const MOBILE_MIN_LENGTH = 11;
const MOBILE_MAX_LENGTH = 15;
const PIN_MIN_LENGTH = 4;
const PIN_MAX_LENGTH = 6;

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function sanitizeWalletInput(field: WalletField, rawValue: string): string {
  if (field === 'mobileNumber') {
    return normalizeDigits(rawValue).slice(0, MOBILE_MAX_LENGTH);
  }

  if (field === 'pinCode') {
    return normalizeDigits(rawValue).slice(0, PIN_MAX_LENGTH);
  }

  return rawValue;
}

export function getWalletState(source: WalletValues): WalletState {
  const mobile = normalizeDigits(source.mobileNumber);
  const pin = normalizeDigits(source.pinCode);

  return {
    isEmpty: mobile.length === 0 && pin.length === 0,
    isValid: mobile.length >= MOBILE_MIN_LENGTH && pin.length >= PIN_MIN_LENGTH,
  };
}

export function getWalletErrorMessage(field: WalletErrorField, source: WalletValues): string {
  if (field === 'mobileNumber') {
    return normalizeDigits(source.mobileNumber).length >= MOBILE_MIN_LENGTH ? '' : 'Enter mobile number.';
  }

  if (field === 'pinCode') {
    return normalizeDigits(source.pinCode).length >= PIN_MIN_LENGTH ? '' : 'Enter PIN code.';
  }

  if (field === 'accountType') {
    return source.accountType ? '' : 'Select account type.';
  }

  return '';
}

export function buildWalletPaymentMethod(
  method: Exclude<PaymentMethodMode, 'card'>,
  source: WalletValues,
): Record<string, unknown> {
  const walletPayload = {
    MobileNumber: normalizeDigits(source.mobileNumber),
    PinCode: normalizeDigits(source.pinCode),
    AccountType: source.accountType,
  };

  if (method === 'bkash') {
    return {
      Bkash: walletPayload,
    };
  }

  return {
    Nagad: walletPayload,
  };
}
