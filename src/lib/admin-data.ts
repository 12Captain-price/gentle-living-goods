import { useSyncExternalStore } from "react";

// ---- Types
export interface AdminSettings {
  vatNumber: string;
  tin: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  ecocashNumber: string;
  usdToZwlRate: number;
  whatsapp1: string;
  whatsapp2: string;
}

export interface Zone {
  id: string;
  name: string;
  feeUsd: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  customerName: string;
  role: string;
  quote: string;
}

// ---- Defaults
const DEFAULTS = {
  settings: {
    vatNumber: "", tin: "", bankName: "", accountName: "", accountNumber: "",
    branch: "", ecocashNumber: "", usdToZwlRate: 27000,
    whatsapp1: "263774098174", whatsapp2: "263775863002",
  } as AdminSettings,
  zones: [
    { id: "cbd", name: "CBD", feeUsd: 0 },
    { id: "suburbs", name: "Suburbs", feeUsd: 2 },
    { id: "nkulumane", name: "Nkulumane", feeUsd: 3 },
    { id: "pumula", name: "Pumula", feeUsd: 3.5 },
    { id: "luveve", name: "Luveve", feeUsd: 3 },
    { id: "entumbane", name: "Entumbane", feeUsd: 2.5 },
    { id: "magwegwe", name: "Magwegwe", feeUsd: 2 },
  ] as Zone[],
  coupons: [
    { id: "welcome10", code: "WELCOME10", discountType: "percentage", value: 10, active: true },
    { id: "student5", code: "STUDENT5", discountType: "percentage", value: 5, active: true },
  ] as Coupon[],
  testimonials: [] as Testimonial[],
};

// ---- Storage plumbing
const KEYS = {
  settings: "sc_admin_settings",
  zones: "sc_admin_zones",
  coupons: "sc_admin_coupons",
  testimonials: "sc_admin_testimonials",
};

type Key = keyof typeof KEYS;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

function useStore<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const snap = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key) ?? "",
    () => "",
  );
  const value: T = snap ? (() => { try { return JSON.parse(snap) as T; } catch { return fallback; } })() : fallback;
  const set = (v: T | ((prev: T) => T)) => {
    const next = typeof v === "function" ? (v as (p: T) => T)(value) : v;
    write(key, next);
  };
  return [value, set];
}

// ---- Getters (non-hook)
export const getSettings = (): AdminSettings => ({ ...DEFAULTS.settings, ...read(KEYS.settings, DEFAULTS.settings) });
export const getZones = (): Zone[] => read(KEYS.zones, DEFAULTS.zones);
export const getCoupons = (): Coupon[] => read(KEYS.coupons, DEFAULTS.coupons);
export const getTestimonials = (): Testimonial[] => read(KEYS.testimonials, DEFAULTS.testimonials);

// ---- Hooks
export function useSettings() {
  const [value, set] = useStore<AdminSettings>(KEYS.settings, DEFAULTS.settings);
  return { settings: { ...DEFAULTS.settings, ...value }, setSettings: (patch: Partial<AdminSettings>) => set({ ...DEFAULTS.settings, ...value, ...patch }) };
}
export function useZones() {
  const [zones, setZones] = useStore<Zone[]>(KEYS.zones, DEFAULTS.zones);
  return {
    zones,
    addZone: (z: Omit<Zone, "id">) => setZones([...zones, { ...z, id: crypto.randomUUID() }]),
    updateZone: (id: string, patch: Partial<Zone>) => setZones(zones.map((z) => z.id === id ? { ...z, ...patch } : z)),
    removeZone: (id: string) => setZones(zones.filter((z) => z.id !== id)),
  };
}
export function useCoupons() {
  const [coupons, setCoupons] = useStore<Coupon[]>(KEYS.coupons, DEFAULTS.coupons);
  return {
    coupons,
    addCoupon: (c: Omit<Coupon, "id">) => setCoupons([...coupons, { ...c, id: crypto.randomUUID() }]),
    updateCoupon: (id: string, patch: Partial<Coupon>) => setCoupons(coupons.map((c) => c.id === id ? { ...c, ...patch } : c)),
    removeCoupon: (id: string) => setCoupons(coupons.filter((c) => c.id !== id)),
  };
}
export function useTestimonials() {
  const [testimonials, setT] = useStore<Testimonial[]>(KEYS.testimonials, DEFAULTS.testimonials);
  return {
    testimonials,
    addTestimonial: (t: Omit<Testimonial, "id">) => setT([...testimonials, { ...t, id: crypto.randomUUID() }]),
    removeTestimonial: (id: string) => setT(testimonials.filter((t) => t.id !== id)),
  };
}

// ---- Helpers
export function findCoupon(code: string): Coupon | undefined {
  const c = getCoupons().find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  return c && c.active ? c : undefined;
}
export function computeCouponDiscount(coupon: Coupon | undefined, subtotal: number): number {
  if (!coupon || !coupon.active) return 0;
  if (coupon.discountType === "percentage") return +(subtotal * coupon.value / 100).toFixed(2);
  return Math.min(coupon.value, subtotal);
}