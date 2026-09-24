import { FieldType } from '@amaderPay/web-sdk';

export type PaymentMethodMode = 'card' | 'bkash' | 'nagad';

export type FieldValues = {
  [FieldType.CardNumber]: string;
  [FieldType.ExpirationDate]: string;
  [FieldType.Cvv]: string;
};

export type FieldErrors = FieldValues;

export const INITIAL_FIELD_VALUES: FieldValues = {
  [FieldType.CardNumber]: '',
  [FieldType.ExpirationDate]: '',
  [FieldType.Cvv]: '',
};

export const INITIAL_FIELD_ERRORS: FieldErrors = {
  [FieldType.CardNumber]: '',
  [FieldType.ExpirationDate]: '',
  [FieldType.Cvv]: '',
};

export type WalletAccountType = 'personal' | 'merchant';

export type WalletValues = {
  mobileNumber: string;
  pinCode: string;
  accountType: WalletAccountType;
};

export type WalletErrors = {
  mobileNumber: string;
  pinCode: string;
  accountType: string;
};

export const INITIAL_WALLET_VALUES: WalletValues = {
  mobileNumber: '',
  pinCode: '',
  accountType: 'personal',
};

export const INITIAL_WALLET_ERRORS: WalletErrors = {
  mobileNumber: '',
  pinCode: '',
  accountType: '',
};
