const FALLBACK_PREFIX = "omnilog";
export function generateLogId() {
    const uuid = tryNativeUuid();
    if (uuid) {
        return uuid;
    }
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `${FALLBACK_PREFIX}-${timestamp}-${random}`;
}
function tryNativeUuid() {
    if (typeof globalThis === "undefined") {
        return null;
    }
    const cryptoRef = globalThis.crypto;
    if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
        return cryptoRef.randomUUID();
    }
    return null;
}
//# sourceMappingURL=id.js.map