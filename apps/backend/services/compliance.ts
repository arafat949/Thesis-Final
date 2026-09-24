// "merchant category code"
const BLOCKED_MCC = new Set([
  "7995", // gambling
  "5921", // liquor stores
  "7273", // dating services
]);

export const verifyCompliance = (mccCode?: string) => {
  if (!mccCode) return { ok: true };
  if (BLOCKED_MCC.has(mccCode)) {
    return { ok: false, reason: "Non-compliant MCC" };
  }
  return { ok: true };
};
