import { FieldType } from '@amaderPay/web-sdk';

export function validateField(fieldType: FieldType, value: string): boolean {
  if (fieldType === FieldType.CardNumber) {
    const rawValue = value.replace(/\D/g, '');
    return rawValue.length >= 8 && rawValue.length <= 25 && checkLuhn(rawValue);
  }

  if (fieldType === FieldType.ExpirationDate) {
    return validateExpiry(value);
  }

  if (fieldType === FieldType.Cvv) {
    return value.length >= 3 && value.length <= 4;
  }

  return value.trim().length >= 2;
}

function checkLuhn(pan: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = pan.length - 1; i >= 0; i--) {
    let digit = pan.charCodeAt(i) - 48;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function checkExpiryState(value: string): 'invalid_format' | 'expired' | 'valid' {
  const match = value.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) {
    return 'invalid_format';
  }

  const month = Number(match[1]);
  const year = Number(match[2]);

  if (month < 1 || month > 12) {
    return 'invalid_format';
  }

  const fullYear = 2000 + year;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return 'expired';
  }

  return 'valid';
}

export function validateExpiry(value: string): boolean {
  return checkExpiryState(value) === 'valid';
}

const MAX_STYLE_VALUE_LENGTH = 256;

export function validateStyleValue(value: string): boolean {
  if (!value || value.trim() === '') {
    return false;
  }
  if (value.length > MAX_STYLE_VALUE_LENGTH) {
    return false;
  }
  if (/url\(|@import|expression\(|javascript:|`/i.test(value)) {
    return false;
  }
  return true;
}
