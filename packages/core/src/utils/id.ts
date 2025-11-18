const FALLBACK_PREFIX = "omnilog";

type MinimalCrypto = {
  randomUUID?: () => string;
};

export function generateLogId(): string {
  const uuid = tryNativeUuid();
  if (uuid) {
    return uuid;
  }

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${FALLBACK_PREFIX}-${timestamp}-${random}`;
}

function tryNativeUuid(): string | null {
  if (typeof globalThis === "undefined") {
    return null;
  }

  const cryptoRef = (globalThis as { crypto?: MinimalCrypto }).crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }

  return null;
}
