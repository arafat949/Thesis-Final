import { z } from "zod";

export const billingAddressSchema = z.object({
  AddressLine1: z.string().optional(),
  City: z.string().optional(),
  State: z.string().optional(),
  PostalCode: z.string().optional(),
  Country: z.string().optional(),
});

export const creditCardSchema = z.object({
  PaymentAccountNumber: z.string().min(13),
  ExpirationDate: z.string().min(4),
  SecurityCode: z.string().min(3),
});

export const mobileWalletSchema = z.object({
  MobileNumber: z.string().min(11),
  PinCode: z.string().min(4),
  AccountType: z.enum(["personal", "merchant"]).default("personal"),
});

export const paymentMethodSchema = z.object({
  BillingFirstName: z.string().optional(),
  BillingLastName: z.string().optional(),
  BillingAddress: billingAddressSchema.optional(),
  CreditCard: creditCardSchema.optional(),
  Bkash: mobileWalletSchema.optional(),
  Nagad: mobileWalletSchema.optional(),
});

export const invoiceSchema = z.object({
  Amount: z.object({
    Currency: z.string().min(1),
    Value: z.union([z.string(), z.number()]).transform((v) => Number(v)),
  }),
});

export const intentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  description: z.string().optional(),
  mccCode: z.string().optional(),
});

export const confirmSchema = z.object({
  clientSecret: z.string(),
  verificationCode: z.string().optional(),
  paymentMethod: paymentMethodSchema,
});

export function detectPaymentType(pm: z.infer<typeof paymentMethodSchema>): string {
  if (pm.Bkash) return "bkash";
  if (pm.Nagad) return "nagad";
  if (pm.CreditCard) return "card";
  return "card"; // default fallback
}

export function cardLast4(pan: string): string {
  return pan.replace(/\D/g, "").slice(-4);
}

export function detectBrand(pan: string): string {
  const num = pan.replace(/\D/g, "");
  if (num.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "mastercard";
  if (num.startsWith("34") || num.startsWith("37")) return "amex";
  return "unknown";
}
