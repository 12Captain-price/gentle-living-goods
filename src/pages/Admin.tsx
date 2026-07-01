import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Tag, Truck, Ticket, MessageSquare,
  FileText, ReceiptText, PenSquare, Info, Building2, Menu, X, LogOut, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useSettings, useZones, useCoupons, useTestimonials,
  Zone, Coupon,
} from "@/lib/admin-data";
import { useQuotations, useInvoices, downloadQuotationPdf, downloadInvoicePdf, Quotation, Invoice, DocItem } from "@/lib/quotations";
import { useEditMode } from "@/lib/site-content";
import { products as seedProducts, Product, fmtUsd, fmtZwl, collections as seedCollections } from "@/data/products";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

// ---- Local Admin-managed products store
const PRODUCTS_KEY = "sc_admin_products";
const CATEGORIES_KEY = "sc_admin_categories";

type AdminProduct = Product;

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const s = () => cb();
  window.addEventListener("storage", s);
  return () => { listeners.delete(cb); window.removeEventListener("storage", s); };
}
function useLocal<T>(key: string, fallback: T): [T, (v: T | ((p: T) => T)) => void] {
  const snap = useSyncExternalStore(subscribe, () => localStorage.getItem(key) ?? "", () => "");
  const value: T = snap ? (() => { try { return JSON.parse(snap) as T; } catch { return fallback; } })() : fallback;
  const set = (v: T | ((p: T) => T)) => {
    const next = typeof v === "function" ? (v as (p: T) => T)(value) : v;
    localStorage.setItem(key, JSON.stringify(next));
    listeners.forEach((l) => l());
  };
  return [value, set];
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "deals", label: "Deals & Discounts", icon: Tag },
  { id: "zones", label: "Delivery Zones", icon: Truck },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "quotations", label: "Quotations", icon: FileText },
  { id: "invoices", label: "Invoices", icon: ReceiptText },
  { id: "content", label: "Site Content", icon: PenSquare },
  { id: "about", label: "About Page", icon: Info },
  { id: "settings", label: "Company Settings", icon: Building2 },
] as const;
type TabId = typeof TABS[number]["id"];

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sc_admin") !== "1") {
      navigate("/admin/login");
    }
  }, [navigate]);

  const signOut = () => {
    sessionStorage.removeItem("sc_admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-linen">
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <p className="font-serif text-xl">Stationery City</p>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mt-1">Admin</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-2.5 text-sm text-left transition-colors",
                  tab === t.id ? "bg-navy/10 text-navy font-medium border-r-2 border-navy" : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ExternalLink className="w-3 h-3" /> View storefront
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive">
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="lg:hidden p-4 border-b border-border bg-background flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          <span className="font-serif text-lg">Admin</span>
        </div>
        <div className="p-6 md:p-10">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "deals" && <DealsTab />}
          {tab === "zones" && <ZonesTab />}
          {tab === "coupons" && <CouponsTab />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "quotations" && <QuotationsTab />}
          {tab === "invoices" && <InvoicesTab />}
          {tab === "content" && <ContentTab />}
          {tab === "about" && <AboutTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};

// -------- Product store hook
function useAdminProducts() {
  return useLocal<AdminProduct[]>(PRODUCTS_KEY, seedProducts);
}
function useCategoriesStore() {
  return useLocal<{ id: string; name: string }[]>(CATEGORIES_KEY, seedCollections.map((c) => ({ id: c.id, name: c.name })));
}

// -------- Dashboard
function DashboardTab() {
  const [products] = useAdminProducts();
  const { zones } = useZones();
  const { coupons } = useCoupons();
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const activeCoupons = coupons.filter((c) => c.active).length;
  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Products" value={products.length} />
        <Stat label="Low stock" value={lowStock} />
        <Stat label="Active coupons" value={activeCoupons} />
        <Stat label="Delivery zones" value={zones.length} />
      </div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background border border-border p-6">
      <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">{label}</p>
      <p className="font-serif text-4xl">{value}</p>
    </div>
  );
}

// -------- Products
function ProductsTab() {
  const [products, setProducts] = useAdminProducts();
  const [categories] = useCategoriesStore();
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const updateStock = (id: string, stock: number) => setProducts(products.map((p) => p.id === id ? { ...p, stock } : p));
  const remove = (id: string) => { if (confirm("Delete this product?")) setProducts(products.filter((p) => p.id !== id)); };
  const save = (p: AdminProduct) => {
    setProducts(products.some((x) => x.id === p.id) ? products.map((x) => x.id === p.id ? p : x) : [p, ...products]);
    setEditing(null); setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Products</h1>
        <Button onClick={() => setShowAdd(true)} className="rounded-none bg-navy hover:bg-navy/90">+ Add Product</Button>
      </div>
      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Sale</th>
              <th className="text-right p-3">Stock</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.collection}</td>
                <td className="p-3 text-right font-mono">{fmtUsd(p.price)}</td>
                <td className="p-3 text-right font-mono">{p.salePrice ? fmtUsd(p.salePrice) : "—"}</td>
                <td className="p-3 text-right">
                  <input type="number" value={p.stock} onChange={(e) => updateStock(p.id, parseInt(e.target.value) || 0)}
                    className="w-16 text-right border border-border px-2 py-1" />
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="text-xs underline mr-3">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-xs text-destructive underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(editing || showAdd) && (
        <ProductModal
          initial={editing || { id: crypto.randomUUID(), name: "", slug: "", collection: categories[0]?.id || "", price: 0, stock: 0,
            description: "", longDescription: "", materials: "", images: [""] } as AdminProduct}
          categories={categories}
          onSave={save}
          onClose={() => { setEditing(null); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

function ProductModal({ initial, categories, onSave, onClose }: {
  initial: AdminProduct; categories: { id: string; name: string }[];
  onSave: (p: AdminProduct) => void; onClose: () => void;
}) {
  const [p, setP] = useState<AdminProduct>(initial);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif text-2xl mb-6">{initial.name ? "Edit" : "Add"} Product</h2>
        <div className="grid gap-4">
          <Field label="Name"><Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} className="rounded-none" /></Field>
          <Field label="Description"><Input value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} className="rounded-none" /></Field>
          <Field label="Long Description"><Textarea value={p.longDescription} onChange={(e) => setP({ ...p, longDescription: e.target.value })} className="rounded-none" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={p.collection} onChange={(e) => setP({ ...p, collection: e.target.value })} className="w-full border border-border h-10 px-3">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Materials"><Input value={p.materials} onChange={(e) => setP({ ...p, materials: e.target.value })} className="rounded-none" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price USD"><Input type="number" step="0.01" value={p.price} onChange={(e) => setP({ ...p, price: parseFloat(e.target.value) || 0 })} className="rounded-none" /></Field>
            <Field label="Sale price"><Input type="number" step="0.01" value={p.salePrice ?? ""} onChange={(e) => setP({ ...p, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })} className="rounded-none" /></Field>
            <Field label="Sale ends"><Input type="date" value={p.saleEndDate ?? ""} onChange={(e) => setP({ ...p, saleEndDate: e.target.value || undefined })} className="rounded-none" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock"><Input type="number" value={p.stock} onChange={(e) => setP({ ...p, stock: parseInt(e.target.value) || 0 })} className="rounded-none" /></Field>
            <Field label="Image URL"><Input value={p.images[0] ?? ""} onChange={(e) => setP({ ...p, images: [e.target.value, ...p.images.slice(1)] })} className="rounded-none" /></Field>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <Button variant="outline" className="rounded-none" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(p)} className="rounded-none bg-navy hover:bg-navy/90">Save</Button>
        </div>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}

// -------- Categories
function CategoriesTab() {
  const [categories, setCategories] = useCategoriesStore();
  const [products] = useAdminProducts();
  const [newName, setNewName] = useState("");

  const add = () => {
    if (!newName.trim()) return;
    setCategories([...categories, { id: newName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: newName.trim() }]);
    setNewName("");
  };
  const rename = (id: string) => {
    const nv = prompt("New name?", categories.find((c) => c.id === id)?.name);
    if (nv) setCategories(categories.map((c) => c.id === id ? { ...c, name: nv } : c));
  };
  const remove = (id: string) => {
    const inUse = products.some((p) => p.collection === id);
    if (inUse && !confirm("This category is in use by products. Delete anyway?")) return;
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Categories</h1>
      <div className="flex gap-2 mb-6">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category name" className="rounded-none max-w-xs" />
        <Button onClick={add} className="rounded-none bg-navy hover:bg-navy/90">Add</Button>
      </div>
      <div className="bg-background border border-border">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 border-b border-border">
            <span>{c.name} <span className="text-xs text-muted-foreground">({c.id})</span></span>
            <div className="flex gap-3">
              <button onClick={() => rename(c.id)} className="text-xs underline">Rename</button>
              <button onClick={() => remove(c.id)} className="text-xs text-destructive underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- Deals
function DealsTab() {
  const [products, setProducts] = useAdminProducts();
  const active = products.filter((p) => p.salePrice !== undefined);
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Deals & Discounts</h1>
      <p className="text-sm text-muted-foreground mb-6">Set a sale price and optional end date per product.</p>
      <div className="bg-background border border-border">
        {products.map((p) => (
          <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center p-3 border-b border-border">
            <span className="text-sm">{p.name} <span className="font-mono text-xs text-muted-foreground">{fmtUsd(p.price)}</span></span>
            <Input type="number" step="0.01" placeholder="Sale price" value={p.salePrice ?? ""} onChange={(e) => setProducts(products.map((x) => x.id === p.id ? { ...x, salePrice: e.target.value ? parseFloat(e.target.value) : undefined } : x))} className="rounded-none" />
            <Input type="date" value={p.saleEndDate ?? ""} onChange={(e) => setProducts(products.map((x) => x.id === p.id ? { ...x, saleEndDate: e.target.value || undefined } : x))} className="rounded-none" />
            <button className="text-xs text-destructive text-left underline" onClick={() => setProducts(products.map((x) => x.id === p.id ? { ...x, salePrice: undefined, saleEndDate: undefined } : x))}>Remove sale</button>
          </div>
        ))}
      </div>
      <div className="mt-6 text-xs text-muted-foreground">Currently on sale: {active.length}</div>
    </div>
  );
}

// -------- Zones
function ZonesTab() {
  const { zones, addZone, updateZone, removeZone } = useZones();
  const [name, setName] = useState(""); const [fee, setFee] = useState("0");
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Delivery Zones</h1>
      <div className="flex gap-2 mb-6">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Suburb name" className="rounded-none max-w-xs" />
        <Input type="number" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Fee USD" className="rounded-none max-w-[120px]" />
        <Button className="rounded-none bg-navy hover:bg-navy/90" onClick={() => { if (name) { addZone({ name, feeUsd: parseFloat(fee) || 0 }); setName(""); setFee("0"); } }}>Add</Button>
      </div>
      <div className="bg-background border border-border">
        {zones.map((z) => (
          <div key={z.id} className="grid grid-cols-3 gap-3 items-center p-3 border-b border-border">
            <Input value={z.name} onChange={(e) => updateZone(z.id, { name: e.target.value })} className="rounded-none" />
            <Input type="number" step="0.01" value={z.feeUsd} onChange={(e) => updateZone(z.id, { feeUsd: parseFloat(e.target.value) || 0 })} className="rounded-none" />
            <button onClick={() => removeZone(z.id)} className="text-xs text-destructive underline text-left">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- Coupons
function CouponsTab() {
  const { coupons, addCoupon, updateCoupon, removeCoupon } = useCoupons();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("0");
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Coupons</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" className="rounded-none max-w-[160px]" />
        <select value={type} onChange={(e) => setType(e.target.value as "percentage" | "fixed")} className="border border-border h-10 px-3">
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed USD</option>
        </select>
        <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="rounded-none max-w-[120px]" />
        <Button className="rounded-none bg-navy hover:bg-navy/90" onClick={() => { if (code) { addCoupon({ code, discountType: type, value: parseFloat(value) || 0, active: true }); setCode(""); setValue("0"); } }}>Add</Button>
      </div>
      <div className="bg-background border border-border">
        {coupons.map((c) => (
          <div key={c.id} className="grid grid-cols-5 gap-3 items-center p-3 border-b border-border text-sm">
            <span className="font-mono">{c.code}</span>
            <span className="text-muted-foreground">{c.discountType}</span>
            <span>{c.discountType === "percentage" ? `${c.value}%` : fmtUsd(c.value)}</span>
            <label className="flex items-center gap-2"><input type="checkbox" checked={c.active} onChange={(e) => updateCoupon(c.id, { active: e.target.checked })} /> Active</label>
            <button onClick={() => removeCoupon(c.id)} className="text-xs text-destructive underline text-left">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- Testimonials
function TestimonialsTab() {
  const { testimonials, addTestimonial, removeTestimonial } = useTestimonials();
  const [name, setName] = useState(""); const [role, setRole] = useState(""); const [quote, setQuote] = useState("");
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Testimonials</h1>
      <div className="grid gap-3 mb-6 max-w-lg">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" className="rounded-none" />
        <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (Teacher, Student…)" className="rounded-none" />
        <Textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Quote" className="rounded-none" />
        <Button className="rounded-none bg-navy hover:bg-navy/90 w-fit" onClick={() => { if (quote) { addTestimonial({ customerName: name, role, quote }); setName(""); setRole(""); setQuote(""); } }}>Add</Button>
      </div>
      <div className="space-y-3">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-background border border-border p-4">
            <p className="italic">"{t.quote}"</p>
            <p className="text-sm mt-2 text-muted-foreground">— {t.customerName}, {t.role}</p>
            <button onClick={() => removeTestimonial(t.id)} className="text-xs text-destructive underline mt-2">Delete</button>
          </div>
        ))}
        {!testimonials.length && <p className="text-sm text-muted-foreground">No testimonials yet.</p>}
      </div>
    </div>
  );
}

// -------- Quotations
function emptyDocItem(): DocItem { return { description: "", qty: 1, unitPriceUsd: 0, total: 0 }; }

function QuotationsTab() {
  const { quotations, saveQuotation, removeQuotation } = useQuotations();
  const { saveInvoice } = useInvoices();
  const { settings } = useSettings();
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => quotations.filter((q) =>
    !search || [q.customerName, q.quoteNumber, q.createdAt].some((s) => s.toLowerCase().includes(search.toLowerCase()))
  ), [quotations, search]);

  const convert = (q: Quotation) => {
    const inv = saveInvoice({
      quotationId: q.id, customerName: q.customerName, customerContact: q.customerContact, customerEmail: q.customerEmail,
      customerVat: q.customerVat, customerTin: q.customerTin, items: q.items,
      subtotalUsd: q.subtotalUsd, totalUsd: q.totalUsd, paymentStatus: "unpaid", amountPaidUsd: 0,
    });
    alert(`Invoice ${inv.invoiceNumber} created.`);
  };

  if (creating || editing) {
    return <QuoteForm initial={editing} onCancel={() => { setCreating(false); setEditing(null); }} onSave={(q) => { const saved = saveQuotation(q); setCreating(false); setEditing(null); if (confirm("Download PDF now?")) downloadQuotationPdf(saved); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Quotations</h1>
        <Button onClick={() => setCreating(true)} className="rounded-none bg-navy hover:bg-navy/90">+ New Quotation</Button>
      </div>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, number, date…" className="rounded-none max-w-sm mb-4" />
      <div className="bg-background border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr><th className="text-left p-3">Number</th><th className="text-left p-3">Customer</th><th className="text-right p-3">Total</th><th className="text-left p-3">Date</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id} className="border-b border-border">
                <td className="p-3 font-mono">{q.quoteNumber}</td>
                <td className="p-3">{q.customerName}</td>
                <td className="p-3 text-right font-mono">{fmtUsd(q.totalUsd)}</td>
                <td className="p-3 text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => downloadQuotationPdf(q)} className="text-xs underline mr-3">PDF</button>
                  <button onClick={() => convert(q)} className="text-xs underline mr-3">Convert</button>
                  <button onClick={() => removeQuotation(q.id)} className="text-xs text-destructive underline">Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No quotations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuoteForm({ initial, onCancel, onSave }: {
  initial: Quotation | null;
  onCancel: () => void;
  onSave: (q: Omit<Quotation, "id" | "quoteNumber" | "createdAt"> & { id?: string }) => void;
}) {
  const { settings } = useSettings();
  const [products] = useAdminProducts();
  const [customer, setCustomer] = useState({
    name: initial?.customerName ?? "", contact: initial?.customerContact ?? "", email: initial?.customerEmail ?? "",
    vat: initial?.customerVat ?? "", tin: initial?.customerTin ?? "",
  });
  const [items, setItems] = useState<DocItem[]>(initial?.items ?? [emptyDocItem()]);
  const [validUntil, setValidUntil] = useState(initial?.validUntil ?? new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const subtotal = items.reduce((s, i) => s + i.total, 0);

  const updateItem = (idx: number, patch: Partial<DocItem>) => {
    setItems(items.map((it, i) => {
      if (i !== idx) return it;
      const merged = { ...it, ...patch };
      merged.total = +(merged.qty * merged.unitPriceUsd).toFixed(2);
      return merged;
    }));
  };

  const addProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const price = p.salePrice ?? p.price;
    setItems([...items, { description: p.name, qty: 1, unitPriceUsd: price, total: price }]);
  };

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">{initial ? "Edit Quotation" : "New Quotation"}</h1>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Field label="Customer name *"><Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="rounded-none" /></Field>
        <Field label="Contact"><Input value={customer.contact} onChange={(e) => setCustomer({ ...customer, contact: e.target.value })} className="rounded-none" /></Field>
        <Field label="Email"><Input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="rounded-none" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="VAT"><Input value={customer.vat} onChange={(e) => setCustomer({ ...customer, vat: e.target.value })} className="rounded-none" /></Field>
          <Field label="TIN"><Input value={customer.tin} onChange={(e) => setCustomer({ ...customer, tin: e.target.value })} className="rounded-none" /></Field>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <select className="border border-border h-10 px-3" onChange={(e) => { if (e.target.value) { addProduct(e.target.value); e.target.value = ""; } }}>
          <option value="">+ Add product…</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {fmtUsd(p.salePrice ?? p.price)}</option>)}
        </select>
        <Button variant="outline" className="rounded-none" onClick={() => setItems([...items, emptyDocItem()])}>+ Custom row</Button>
      </div>

      <div className="bg-background border border-border mb-6">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr><th className="text-left p-2 w-8">#</th><th className="text-left p-2">Description</th><th className="p-2 w-20">Qty</th><th className="p-2 w-32">Unit Price</th><th className="p-2 w-32 text-right">Total</th><th className="p-2 w-10"></th></tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-b border-border">
                <td className="p-2 text-muted-foreground">{idx + 1}</td>
                <td className="p-2"><Input value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} className="rounded-none" /></td>
                <td className="p-2"><Input type="number" value={it.qty} onChange={(e) => updateItem(idx, { qty: parseInt(e.target.value) || 0 })} className="rounded-none" /></td>
                <td className="p-2"><Input type="number" step="0.01" value={it.unitPriceUsd} onChange={(e) => updateItem(idx, { unitPriceUsd: parseFloat(e.target.value) || 0 })} className="rounded-none" /></td>
                <td className="p-2 text-right font-mono">{fmtUsd(it.total)}</td>
                <td className="p-2"><button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-destructive text-xs">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <Field label="Valid until"><Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="rounded-none" /></Field>
          <Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-none" /></Field>
        </div>
        <div className="bg-linen p-6">
          <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span className="font-mono">{fmtUsd(subtotal)}</span></div>
          <div className="flex justify-between text-lg font-serif border-t pt-3">
            <span>Total</span>
            <div className="text-right">
              <div className="font-mono text-navy">{fmtUsd(subtotal)}</div>
              <div className="font-mono text-xs text-muted-foreground">{fmtZwl(subtotal, settings.usdToZwlRate)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="rounded-none" onClick={onCancel}>Cancel</Button>
        <Button className="rounded-none bg-navy hover:bg-navy/90" onClick={() => onSave({
          id: initial?.id, customerName: customer.name, customerContact: customer.contact, customerEmail: customer.email,
          customerVat: customer.vat, customerTin: customer.tin, items, subtotalUsd: subtotal, totalUsd: subtotal,
          validUntil, notes,
        })}>Save</Button>
      </div>
    </div>
  );
}

// -------- Invoices
function InvoicesTab() {
  const { invoices, updateInvoiceStatus, removeInvoice } = useInvoices();
  const [filter, setFilter] = useState<"all" | Invoice["paymentStatus"]>("all");
  const [search, setSearch] = useState("");

  const filtered = invoices.filter((i) =>
    (filter === "all" || i.paymentStatus === filter) &&
    (!search || [i.customerName, i.invoiceNumber].some((s) => s.toLowerCase().includes(search.toLowerCase())))
  );

  const badge = (s: Invoice["paymentStatus"]) => {
    const cls = s === "paid" ? "bg-green-100 text-green-800" : s === "partial" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
    return <span className={cn("text-[10px] px-2 py-0.5 rounded-full", cls)}>{s.toUpperCase()}</span>;
  };

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Invoices</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "unpaid", "partial", "paid"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 text-xs uppercase tracking-wide", filter === f ? "bg-navy text-white" : "bg-background border border-border")}>{f}</button>
        ))}
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="rounded-none max-w-sm ml-auto" />
      </div>
      <div className="bg-background border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40"><tr>
            <th className="text-left p-3">Number</th><th className="text-left p-3">Customer</th><th className="text-right p-3">Total</th>
            <th className="text-right p-3">Paid</th><th className="text-left p-3">Status</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b border-border">
                <td className="p-3 font-mono">{i.invoiceNumber}</td>
                <td className="p-3">{i.customerName}</td>
                <td className="p-3 text-right font-mono">{fmtUsd(i.totalUsd)}</td>
                <td className="p-3 text-right">
                  <Input type="number" step="0.01" value={i.amountPaidUsd} onChange={(e) => {
                    const paid = parseFloat(e.target.value) || 0;
                    const status: Invoice["paymentStatus"] = paid >= i.totalUsd ? "paid" : paid > 0 ? "partial" : "unpaid";
                    updateInvoiceStatus(i.id, status, paid);
                  }} className="rounded-none w-24 text-right" />
                </td>
                <td className="p-3">
                  <select value={i.paymentStatus} onChange={(e) => updateInvoiceStatus(i.id, e.target.value as Invoice["paymentStatus"])} className="border border-border px-2 py-1 text-xs mb-1">
                    <option value="unpaid">unpaid</option>
                    <option value="partial">partial</option>
                    <option value="paid">paid</option>
                  </select>
                  <div>{badge(i.paymentStatus)}</div>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => downloadInvoicePdf(i)} className="text-xs underline mr-3">PDF</button>
                  <button onClick={() => removeInvoice(i.id)} className="text-xs text-destructive underline">Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No invoices.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------- Site Content
const CONTENT_FIELDS = [
  { key: "home.hero.eyebrow", label: "Homepage — hero eyebrow", def: "Bulawayo · Est. Main Street Mall" },
  { key: "home.hero.headline1", label: "Homepage — hero line 1", def: "Everything" },
  { key: "home.hero.headline2", label: "Homepage — hero line 2", def: "You Write With" },
  { key: "home.hero.subtext", label: "Homepage — hero subtext", def: "Pens, notebooks, files, art supplies and school essentials — carefully stocked for students, offices and creatives across Zimbabwe." },
  { key: "home.featured.title", label: "Homepage — featured title", def: "Pens & Writing" },
  { key: "home.featured.description", label: "Homepage — featured description", def: "From the trusted BIC Cristal to the iconic Parker Jotter — find a pen that suits the way you think, work and sign." },
  { key: "home.about.body", label: "Homepage — about body", def: "For over a decade, Stationery City has kept Bulawayo's classrooms, boardrooms and studios stocked — one honest pen, notebook and ream at a time." },
  { key: "home.visit.title", label: "Homepage — visit title", def: "Come Say Hello" },
  { key: "footer.tagline", label: "Footer tagline", def: "Bulawayo's home for pens, paper and everything in between." },
  { key: "about.hero.eyebrow", label: "About — hero eyebrow", def: "Our Story" },
  { key: "about.hero.headline", label: "About — hero headline", def: "Bulawayo's Stationery Home" },
  { key: "about.hero.subtext", label: "About — hero subtext", def: "Trusted pens, notebooks and office essentials — stocked with care at Shop R4, Main Street Mall." },
  { key: "about.philosophy", label: "About — philosophy quote", def: "We believe the right pen, the right notebook and the right file can make school easier, work sharper and ideas travel further." },
];

function ContentTab() {
  const [editMode, setEditMode] = useEditMode();
  return (
    <div>
      <h1 className="font-serif text-3xl mb-2">Site Content</h1>
      <p className="text-sm text-muted-foreground mb-6">Toggle edit mode ON, then open the storefront in another tab to click-edit any text or image.</p>

      <label className="inline-flex items-center gap-3 mb-6 cursor-pointer">
        <input type="checkbox" checked={editMode} onChange={(e) => setEditMode(e.target.checked)} className="w-5 h-5" />
        <span className="text-sm font-medium">Edit Mode {editMode ? "ON" : "OFF"}</span>
      </label>

      <div className="bg-background border border-border divide-y divide-border">
        {CONTENT_FIELDS.map((f) => <ContentRow key={f.key} field={f} />)}
      </div>
    </div>
  );
}

function ContentRow({ field }: { field: { key: string; label: string; def: string } }) {
  const storageKey = `sc_content:${field.key}`;
  const [snap] = [localStorage.getItem(storageKey)];
  const [val, setVal] = useState(snap ?? field.def);
  return (
    <div className="p-4 grid md:grid-cols-3 gap-3 items-start">
      <div>
        <p className="text-sm font-medium">{field.label}</p>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">{field.key}</p>
      </div>
      <Textarea value={val} onChange={(e) => setVal(e.target.value)} className="rounded-none md:col-span-2" />
      <div className="md:col-span-3 flex gap-3 justify-end">
        <button onClick={() => { localStorage.removeItem(storageKey); setVal(field.def); window.dispatchEvent(new StorageEvent("storage")); }} className="text-xs underline">Reset</button>
        <button onClick={() => { localStorage.setItem(storageKey, val); window.dispatchEvent(new StorageEvent("storage")); }} className="text-xs bg-navy text-white px-4 py-1">Save</button>
      </div>
    </div>
  );
}

// -------- About Page
function AboutTab() {
  const [gallery, setGallery] = useLocal<{ src: string; caption: string }[]>("sc_about_gallery", []);
  const [logos, setLogos] = useLocal<{ name: string; src: string; url?: string }[]>("sc_about_logos", []);
  const [galSrc, setGalSrc] = useState(""); const [galCap, setGalCap] = useState("");
  const [logoName, setLogoName] = useState(""); const [logoSrc, setLogoSrc] = useState(""); const [logoUrl, setLogoUrl] = useState("");

  const move = <T,>(list: T[], idx: number, delta: number): T[] => {
    const j = idx + delta;
    if (j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[idx], next[j]] = [next[j], next[idx]];
    return next;
  };

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">About Page</h1>

      <section className="mb-10">
        <h2 className="font-serif text-xl mb-3">Gallery</h2>
        <div className="flex gap-2 mb-4">
          <Input value={galSrc} onChange={(e) => setGalSrc(e.target.value)} placeholder="Image URL" className="rounded-none" />
          <Input value={galCap} onChange={(e) => setGalCap(e.target.value)} placeholder="Caption" className="rounded-none" />
          <Button className="rounded-none bg-navy hover:bg-navy/90" onClick={() => { if (galSrc) { setGallery([...gallery, { src: galSrc, caption: galCap }]); setGalSrc(""); setGalCap(""); } }}>Add</Button>
        </div>
        <div className="grid gap-2">
          {gallery.map((g, i) => (
            <div key={i} className="flex items-center gap-3 bg-background border border-border p-2">
              <img src={g.src} alt="" className="w-16 h-16 object-cover" />
              <p className="flex-1 text-sm">{g.caption}</p>
              <button className="text-xs underline" onClick={() => setGallery(move(gallery, i, -1))}>↑</button>
              <button className="text-xs underline" onClick={() => setGallery(move(gallery, i, 1))}>↓</button>
              <button className="text-xs text-destructive underline" onClick={() => setGallery(gallery.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-3">Brand Logos</h2>
        <div className="grid md:grid-cols-4 gap-2 mb-4">
          <Input value={logoName} onChange={(e) => setLogoName(e.target.value)} placeholder="Name" className="rounded-none" />
          <Input value={logoSrc} onChange={(e) => setLogoSrc(e.target.value)} placeholder="Image URL" className="rounded-none" />
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Link (optional)" className="rounded-none" />
          <Button className="rounded-none bg-navy hover:bg-navy/90" onClick={() => { if (logoSrc) { setLogos([...logos, { name: logoName, src: logoSrc, url: logoUrl || undefined }]); setLogoName(""); setLogoSrc(""); setLogoUrl(""); } }}>Add</Button>
        </div>
        <div className="grid gap-2">
          {logos.map((l, i) => (
            <div key={i} className="flex items-center gap-3 bg-background border border-border p-2">
              <img src={l.src} alt={l.name} className="w-16 h-16 object-contain" />
              <p className="flex-1 text-sm">{l.name} {l.url && <span className="text-xs text-muted-foreground">→ {l.url}</span>}</p>
              <button className="text-xs underline" onClick={() => setLogos(move(logos, i, -1))}>↑</button>
              <button className="text-xs underline" onClick={() => setLogos(move(logos, i, 1))}>↓</button>
              <button className="text-xs text-destructive underline" onClick={() => setLogos(logos.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// -------- Company Settings
function SettingsTab() {
  const { settings, setSettings } = useSettings();
  const [local, setLocal] = useState(settings);
  useEffect(() => setLocal(settings), [settings]);
  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Company Settings</h1>
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <Field label="VAT Number"><Input value={local.vatNumber} onChange={(e) => setLocal({ ...local, vatNumber: e.target.value })} className="rounded-none" /></Field>
        <Field label="TIN"><Input value={local.tin} onChange={(e) => setLocal({ ...local, tin: e.target.value })} className="rounded-none" /></Field>
        <Field label="Bank Name"><Input value={local.bankName} onChange={(e) => setLocal({ ...local, bankName: e.target.value })} className="rounded-none" /></Field>
        <Field label="Account Name"><Input value={local.accountName} onChange={(e) => setLocal({ ...local, accountName: e.target.value })} className="rounded-none" /></Field>
        <Field label="Account Number"><Input value={local.accountNumber} onChange={(e) => setLocal({ ...local, accountNumber: e.target.value })} className="rounded-none" /></Field>
        <Field label="Branch"><Input value={local.branch} onChange={(e) => setLocal({ ...local, branch: e.target.value })} className="rounded-none" /></Field>
        <Field label="EcoCash Number"><Input value={local.ecocashNumber} onChange={(e) => setLocal({ ...local, ecocashNumber: e.target.value })} className="rounded-none" /></Field>
        <Field label="USD to ZWL Rate"><Input type="number" value={local.usdToZwlRate} onChange={(e) => setLocal({ ...local, usdToZwlRate: parseFloat(e.target.value) || 0 })} className="rounded-none" /></Field>
        <Field label="WhatsApp 1"><Input value={local.whatsapp1} onChange={(e) => setLocal({ ...local, whatsapp1: e.target.value })} className="rounded-none" /></Field>
        <Field label="WhatsApp 2"><Input value={local.whatsapp2} onChange={(e) => setLocal({ ...local, whatsapp2: e.target.value })} className="rounded-none" /></Field>
      </div>
      <Button onClick={() => setSettings(local)} className="mt-6 rounded-none bg-navy hover:bg-navy/90">Save Settings</Button>
    </div>
  );
}

export default Admin;