import { FieldType } from '@amaderPay/web-sdk';

const NON_DIGIT_REGEX = /\D/g;
const MAX_CARD_DIGITS = 25;

export function formatInput(fieldType: FieldType, inputValue: string): string {
  if (fieldType === FieldType.CardNumber) {
    const rawValue = inputValue.replace(NON_DIGIT_REGEX, '').slice(0, MAX_CARD_DIGITS);
    return rawValue.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  if (fieldType === FieldType.ExpirationDate) {
    if (inputValue.endsWith('/')) {
      const rawValue = inputValue.replace(NON_DIGIT_REGEX, '');
      return rawValue.substring(0, rawValue.length - 1);
    }

    const rawValue = inputValue.replace(NON_DIGIT_REGEX, '').slice(0, 4);
    if (rawValue.length < 2) {
      return rawValue;
    } else if (rawValue.length === 2) {
      return `${rawValue.substring(0, 2)} / `;
    }
    return `${rawValue.substring(0, 2)} / ${rawValue.substring(2, 4)}`;
  }

  if (fieldType === FieldType.Cvv) {
    return inputValue.replace(NON_DIGIT_REGEX, '').slice(0, 4);
  }

  return inputValue.replace(/\s+/g, ' ').trimStart();
}
