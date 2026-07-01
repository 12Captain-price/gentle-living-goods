// crypto.randomUUID() is only available in secure contexts (https, or
// exactly "localhost"). Testing over a plain http:// network IP (e.g.
// 192.168.x.x) doesn't expose it, so fall back to a manual UUID v4.
export function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}