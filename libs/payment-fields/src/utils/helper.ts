import { FieldType, CardData } from '@amaderPay/web-sdk';
import { checkExpiryState } from './validators';

export function isFieldType(value: string): value is FieldType {
  return Object.values(FieldType).includes(value as FieldType);
}

export function getErrorMessage(fieldType: FieldType, value: string): string {
  switch (fieldType) {
    case FieldType.CardNumber:
      return 'Enter a valid card number.';
    case FieldType.Cvv:
      return 'Enter a valid security code.';
    case FieldType.ExpirationDate:
      return checkExpiryState(value) === 'expired' ? 'Your card has expired.' : 'Enter a valid expiry date.';
    default:
      return 'Invalid field';
  }
}

export function normalizeCardData(currentValue: CardData): Record<string, unknown> {
  const cardNumber = currentValue.cardNumber.replace(/\s+/g, '');
  const expiration = currentValue.expirationDate.replace(/[^0-9]/g, '');
  
  return {
    CreditCard: {
      PaymentAccountNumber: cardNumber,
      ExpirationDate: expiration,
      SecurityCode: currentValue.cvv
    }
  };
}
