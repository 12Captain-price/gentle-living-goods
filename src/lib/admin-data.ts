import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { products as seedProducts, collections as seedCollections, Product } from "@/data/products";

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

export interface Category {
  id: string;
  name: string;
}

export interface GalleryImage {
  id?: string;
  src: string;
  caption: string;
}

export interface LogoItem {
  id?: string;
  name: string;
  src: string;
  url?: string;
}

const DEFAULT_SETTINGS: AdminSettings = {
  vatNumber: "", tin: "", bankName: "", accountName: "", accountNumber: "",
  branch: "", ecocashNumber: "", usdToZwlRate: 27000,
  whatsapp1: "263774098174", whatsapp2: "263775863002",
};

// ============================================================
// Generic realtime-synced table cache.
// Each table gets an in-memory cache that's populated on load,
// kept fresh via a Supabase Realtime subscription, and exposed to
// React via useSyncExternalStore so every device/tab stays in sync.
// ============================================================
function createTableStore<Row extends Record<string, any>>(
  table: string,
  opts?: { orderBy?: string; ascending?: boolean }
) {
  let cache: Row[] = [];
  let ready = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  async function refresh() {
    let query = supabase.from(table).select("*");
    if (opts?.orderBy) query = query.order(opts.orderBy, { ascending: opts?.ascending ?? true });
    const { data, error } = await query;
    if (!error && data) {
      cache = data as Row[];
      ready = true;
      emit();
    }
  }

  if (typeof window !== "undefined") {
    refresh();
    supabase
      .channel(`public:${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => refresh())
      .subscribe();
  }

  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot: () => cache,
    getServerSnapshot: () => [] as Row[],
    refresh,
    isReady: () => ready,
  };
}

const productsStore = createTableStore<any>("products", { orderBy: "created_at" });
const categoriesStore = createTableStore<any>("categories", { orderBy: "name" });
const zonesStore = createTableStore<any>("delivery_zones", { orderBy: "name" });
const couponsStore = createTableStore<any>("coupons", { orderBy: "code" });
const testimonialsStore = createTableStore<any>("testimonials");
const galleryStore = createTableStore<any>("about_gallery", { orderBy: "sort_order" });
const logosStore = createTableStore<any>("about_logos", { orderBy: "sort_order" });
const settingsStore = createTableStore<any>("settings");

// ---- Mapping: DB row (snake_case) <-> app shape (camelCase)
const productFromRow = (r: any): Product => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  collection: r.collection,
  price: Number(r.price),
  description: r.description ?? "",
  longDescription: r.long_description ?? "",
  materials: r.materials ?? "",
  dimensions: r.dimensions ?? undefined,
  images: r.images ?? [],
  featured: r.featured ?? false,
  new: r.is_new ?? false,
  stock: r.stock ?? 0,
  salePrice: r.sale_price != null ? Number(r.sale_price) : undefined,
  saleEndDate: r.sale_end_date ?? undefined,
});
const productToRow = (p: Partial<Product>) => ({
  ...(p.name !== undefined && { name: p.name }),
  ...(p.slug !== undefined && { slug: p.slug }),
  ...(p.collection !== undefined && { collection: p.collection }),
  ...(p.price !== undefined && { price: p.price }),
  ...(p.description !== undefined && { description: p.description }),
  ...(p.longDescription !== undefined && { long_description: p.longDescription }),
  ...(p.materials !== undefined && { materials: p.materials }),
  ...(p.dimensions !== undefined && { dimensions: p.dimensions || null }),
  ...(p.images !== undefined && { images: p.images }),
  ...(p.featured !== undefined && { featured: p.featured }),
  ...(p.new !== undefined && { is_new: p.new }),
  ...(p.stock !== undefined && { stock: p.stock }),
  ...(p.salePrice !== undefined && { sale_price: p.salePrice ?? null }),
  ...(p.saleEndDate !== undefined && { sale_end_date: p.saleEndDate || null }),
});

const settingsFromRow = (r: any): AdminSettings => ({
  vatNumber: r?.vat_number ?? DEFAULT_SETTINGS.vatNumber,
  tin: r?.tin ?? DEFAULT_SETTINGS.tin,
  bankName: r?.bank_name ?? DEFAULT_SETTINGS.bankName,
  accountName: r?.account_name ?? DEFAULT_SETTINGS.accountName,
  accountNumber: r?.account_number ?? DEFAULT_SETTINGS.accountNumber,
  branch: r?.branch ?? DEFAULT_SETTINGS.branch,
  ecocashNumber: r?.ecocash_number ?? DEFAULT_SETTINGS.ecocashNumber,
  usdToZwlRate: r?.usd_to_zwl_rate != null ? Number(r.usd_to_zwl_rate) : DEFAULT_SETTINGS.usdToZwlRate,
  whatsapp1: r?.whatsapp1 ?? DEFAULT_SETTINGS.whatsapp1,
  whatsapp2: r?.whatsapp2 ?? DEFAULT_SETTINGS.whatsapp2,
});
const settingsToRow = (s: Partial<AdminSettings>) => ({
  ...(s.vatNumber !== undefined && { vat_number: s.vatNumber }),
  ...(s.tin !== undefined && { tin: s.tin }),
  ...(s.bankName !== undefined && { bank_name: s.bankName }),
  ...(s.accountName !== undefined && { account_name: s.accountName }),
  ...(s.accountNumber !== undefined && { account_number: s.accountNumber }),
  ...(s.branch !== undefined && { branch: s.branch }),
  ...(s.ecocashNumber !== undefined && { ecocash_number: s.ecocashNumber }),
  ...(s.usdToZwlRate !== undefined && { usd_to_zwl_rate: s.usdToZwlRate }),
  ...(s.whatsapp1 !== undefined && { whatsapp1: s.whatsapp1 }),
  ...(s.whatsapp2 !== undefined && { whatsapp2: s.whatsapp2 }),
});

// ============================================================
// One-time seed: if the products table is empty, populate it from
// the original static catalog so the storefront isn't blank on a
// fresh Supabase project. Guarded so it only ever runs once.
// ============================================================
let seedAttempted = false;
async function seedIfEmpty() {
  if (seedAttempted || typeof window === "undefined") return;
  seedAttempted = true;
  try {
    const { count: catCount } = await supabase.from("categories").select("id", { count: "exact", head: true });
    if (!catCount) {
      await supabase.from("categories").insert(
        seedCollections.map((c) => ({ id: c.id, name: c.name }))
      );
    }
    const { count: prodCount } = await supabase.from("products").select("id", { count: "exact", head: true });
    if (!prodCount) {
      await supabase.from("products").insert(
        seedProducts.map((p) => ({
          name: p.name, slug: p.slug, collection: p.collection, price: p.price,
          description: p.description, long_description: p.longDescription, materials: p.materials,
          dimensions: p.dimensions ?? null, images: p.images, featured: p.featured ?? false,
          is_new: p.new ?? false, stock: p.stock, sale_price: p.salePrice ?? null,
          sale_end_date: p.saleEndDate ?? null,
        }))
      );
    }
    const { count: zoneCount } = await supabase.from("delivery_zones").select("id", { count: "exact", head: true });
    if (!zoneCount) {
      await supabase.from("delivery_zones").insert([
        { name: "CBD", fee_usd: 0 },
        { name: "Suburbs", fee_usd: 2 },
        { name: "Nkulumane", fee_usd: 3 },
        { name: "Pumula", fee_usd: 3.5 },
        { name: "Luveve", fee_usd: 3 },
        { name: "Entumbane", fee_usd: 2.5 },
        { name: "Magwegwe", fee_usd: 2 },
      ]);
    }
    const { count: couponCount } = await supabase.from("coupons").select("id", { count: "exact", head: true });
    if (!couponCount) {
      await supabase.from("coupons").insert([
        { code: "WELCOME10", discount_type: "percentage", value: 10, active: true },
        { code: "STUDENT5", discount_type: "percentage", value: 5, active: true },
      ]);
    }
    productsStore.refresh();
    categoriesStore.refresh();
    zonesStore.refresh();
    couponsStore.refresh();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Zozo: seed failed", err);
  }
}
seedIfEmpty();

function useTable<Row>(store: ReturnType<typeof createTableStore>): Row[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot) as Row[];
}

// ---- Getters (non-hook, best-effort synchronous reads from cache)
export const getSettings = (): AdminSettings => settingsFromRow(settingsStore.getSnapshot()[0]);
export const getZones = (): Zone[] => zonesStore.getSnapshot().map((z: any) => ({ id: z.id, name: z.name, feeUsd: Number(z.fee_usd) }));
export const getCoupons = (): Coupon[] => couponsStore.getSnapshot().map((c: any) => ({ id: c.id, code: c.code, discountType: c.discount_type, value: Number(c.value), active: c.active }));
export const getTestimonials = (): Testimonial[] => testimonialsStore.getSnapshot().map((t: any) => ({ id: t.id, customerName: t.customer_name, role: t.role, quote: t.quote }));
export const getAdminProducts = (): Product[] => productsStore.getSnapshot().map(productFromRow);
export const getCategories = (): Category[] => categoriesStore.getSnapshot().map((c: any) => ({ id: c.id, name: c.name }));
export const getAboutGallery = (): GalleryImage[] => galleryStore.getSnapshot().map((g: any) => ({ id: g.id, src: g.src, caption: g.caption }));
export const getAboutLogos = (): LogoItem[] => logosStore.getSnapshot().map((l: any) => ({ id: l.id, name: l.name, src: l.src, url: l.url ?? undefined }));

// ---- Hooks
export function useSettings() {
  const rows = useTable<any>(settingsStore);
  const settings = settingsFromRow(rows[0]);
  const setSettings = (patch: Partial<AdminSettings>) => {
    supabase.from("settings").update(settingsToRow(patch)).eq("id", 1).then();
  };
  return { settings, setSettings };
}

export function useZones() {
  const rows = useTable<any>(zonesStore);
  const zones: Zone[] = rows.map((z) => ({ id: z.id, name: z.name, feeUsd: Number(z.fee_usd) }));
  return {
    zones,
    addZone: (z: Omit<Zone, "id">) => { supabase.from("delivery_zones").insert({ name: z.name, fee_usd: z.feeUsd }).then(); },
    updateZone: (id: string, patch: Partial<Zone>) => {
      supabase.from("delivery_zones").update({
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.feeUsd !== undefined && { fee_usd: patch.feeUsd }),
      }).eq("id", id).then();
    },
    removeZone: (id: string) => { supabase.from("delivery_zones").delete().eq("id", id).then(); },
  };
}

export function useCoupons() {
  const rows = useTable<any>(couponsStore);
  const coupons: Coupon[] = rows.map((c) => ({ id: c.id, code: c.code, discountType: c.discount_type, value: Number(c.value), active: c.active }));
  return {
    coupons,
    addCoupon: (c: Omit<Coupon, "id">) => {
      supabase.from("coupons").insert({ code: c.code, discount_type: c.discountType, value: c.value, active: c.active }).then();
    },
    updateCoupon: (id: string, patch: Partial<Coupon>) => {
      supabase.from("coupons").update({
        ...(patch.code !== undefined && { code: patch.code }),
        ...(patch.discountType !== undefined && { discount_type: patch.discountType }),
        ...(patch.value !== undefined && { value: patch.value }),
        ...(patch.active !== undefined && { active: patch.active }),
      }).eq("id", id).then();
    },
    removeCoupon: (id: string) => { supabase.from("coupons").delete().eq("id", id).then(); },
  };
}

export function useTestimonials() {
  const rows = useTable<any>(testimonialsStore);
  const testimonials: Testimonial[] = rows.map((t) => ({ id: t.id, customerName: t.customer_name, role: t.role, quote: t.quote }));
  return {
    testimonials,
    addTestimonial: (t: Omit<Testimonial, "id">) => {
      supabase.from("testimonials").insert({ customer_name: t.customerName, role: t.role, quote: t.quote }).then();
    },
    removeTestimonial: (id: string) => { supabase.from("testimonials").delete().eq("id", id).then(); },
  };
}

// ---- Products (shared between Admin and storefront)
export function useAdminProducts(): [Product[], (updater: Product[] | ((prev: Product[]) => Product[])) => void] {
  const rows = useTable<any>(productsStore);
  const products = rows.map(productFromRow);

  const set = (updater: Product[] | ((prev: Product[]) => Product[])) => {
    const next = typeof updater === "function" ? (updater as (p: Product[]) => Product[])(products) : updater;
    void reconcileProducts(products, next);
  };
  return [products, set];
}

async function reconcileProducts(prev: Product[], next: Product[]) {
  const prevIds = new Set(prev.map((p) => p.id));
  const nextIds = new Set(next.map((p) => p.id));

  const toDelete = prev.filter((p) => !nextIds.has(p.id));
  const toInsert = next.filter((p) => !prevIds.has(p.id));
  const toUpdate = next.filter((p) => {
    const before = prev.find((b) => b.id === p.id);
    return before && JSON.stringify(before) !== JSON.stringify(p);
  });

  await Promise.all([
    ...toDelete.map((p) => supabase.from("products").delete().eq("id", p.id)),
    ...toInsert.map((p) => supabase.from("products").insert(productToRow(p))),
    ...toUpdate.map((p) => supabase.from("products").update(productToRow(p)).eq("id", p.id)),
  ]);
  productsStore.refresh();
}

/** Read-only convenience for storefront pages that just need the live product list. */
export function useProducts(): Product[] {
  const [products] = useAdminProducts();
  return products;
}

export function useCategories(): [Category[], (updater: Category[] | ((prev: Category[]) => Category[])) => void] {
  const rows = useTable<any>(categoriesStore);
  const categories: Category[] = rows.map((c) => ({ id: c.id, name: c.name }));

  const set = (updater: Category[] | ((prev: Category[]) => Category[])) => {
    const next = typeof updater === "function" ? (updater as (p: Category[]) => Category[])(categories) : updater;
    void reconcileCategories(categories, next);
  };
  return [categories, set];
}

async function reconcileCategories(prev: Category[], next: Category[]) {
  const prevIds = new Set(prev.map((c) => c.id));
  const nextIds = new Set(next.map((c) => c.id));
  const toDelete = prev.filter((c) => !nextIds.has(c.id));
  const toInsert = next.filter((c) => !prevIds.has(c.id));
  const toUpdate = next.filter((c) => {
    const before = prev.find((b) => b.id === c.id);
    return before && before.name !== c.name;
  });
  await Promise.all([
    ...toDelete.map((c) => supabase.from("categories").delete().eq("id", c.id)),
    ...toInsert.map((c) => supabase.from("categories").insert({ id: c.id, name: c.name })),
    ...toUpdate.map((c) => supabase.from("categories").update({ name: c.name }).eq("id", c.id)),
  ]);
  categoriesStore.refresh();
}

export function useAboutGallery(): [GalleryImage[], (updater: GalleryImage[] | ((prev: GalleryImage[]) => GalleryImage[])) => void] {
  const rows = useTable<any>(galleryStore);
  const gallery: GalleryImage[] = rows.map((g) => ({ id: g.id, src: g.src, caption: g.caption }));
  const set = (updater: GalleryImage[] | ((prev: GalleryImage[]) => GalleryImage[])) => {
    const next = typeof updater === "function" ? (updater as (p: GalleryImage[]) => GalleryImage[])(gallery) : updater;
    void reconcileList(gallery, next, "about_gallery", (g, i) => ({ src: g.src, caption: g.caption, sort_order: i }), galleryStore);
  };
  return [gallery, set];
}

export function useAboutLogos(): [LogoItem[], (updater: LogoItem[] | ((prev: LogoItem[]) => LogoItem[])) => void] {
  const rows = useTable<any>(logosStore);
  const logos: LogoItem[] = rows.map((l) => ({ id: l.id, name: l.name, src: l.src, url: l.url ?? undefined }));
  const set = (updater: LogoItem[] | ((prev: LogoItem[]) => LogoItem[])) => {
    const next = typeof updater === "function" ? (updater as (p: LogoItem[]) => LogoItem[])(logos) : updater;
    void reconcileList(logos, next, "about_logos", (l, i) => ({ name: l.name, src: l.src, url: l.url ?? null, sort_order: i }), logosStore);
  };
  return [logos, set];
}

async function reconcileList<T extends { id?: string }>(
  prev: T[], next: T[], table: string, toRow: (item: T, index: number) => any, store: ReturnType<typeof createTableStore>
) {
  const prevIds = new Set(prev.filter((p) => p.id).map((p) => p.id));
  const nextIds = new Set(next.filter((n) => n.id).map((n) => n.id));
  const toDelete = prev.filter((p) => p.id && !nextIds.has(p.id));
  await Promise.all(toDelete.map((p) => supabase.from(table).delete().eq("id", p.id)));
  await Promise.all(next.map((item, i) => {
    if (item.id && prevIds.has(item.id)) {
      return supabase.from(table).update(toRow(item, i)).eq("id", item.id);
    }
    return supabase.from(table).insert(toRow(item, i));
  }));
  store.refresh();
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
