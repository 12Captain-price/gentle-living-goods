import { useSyncExternalStore } from "react";

export interface DocItem {
  description: string;
  qty: number;
  unitPriceUsd: number;
  total: number;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  customerVat: string;
  customerTin: string;
  items: DocItem[];
  subtotalUsd: number;
  totalUsd: number;
  validUntil: string;
  notes: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  customerVat: string;
  customerTin: string;
  items: DocItem[];
  subtotalUsd: number;
  totalUsd: number;
  paymentStatus: "unpaid" | "partial" | "paid";
  amountPaidUsd: number;
  createdAt: string;
}

const KEYS = { quotations: "sc_quotations", invoices: "sc_invoices" };
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) {
  listeners.add(cb);
  const s = () => cb();
  window.addEventListener("storage", s);
  return () => { listeners.delete(cb); window.removeEventListener("storage", s); };
}
function read<T>(k: string, f: T): T {
  try { const r = window.localStorage.getItem(k); return r ? JSON.parse(r) as T : f; } catch { return f; }
}
function write<T>(k: string, v: T) { window.localStorage.setItem(k, JSON.stringify(v)); emit(); }

function useStore<T>(key: string, fallback: T): [T, (v: T | ((p: T) => T)) => void] {
  const snap = useSyncExternalStore(subscribe, () => window.localStorage.getItem(key) ?? "", () => "");
  const value: T = snap ? (() => { try { return JSON.parse(snap) as T; } catch { return fallback; } })() : fallback;
  const set = (v: T | ((p: T) => T)) => write(key, typeof v === "function" ? (v as (p: T) => T)(value) : v);
  return [value, set];
}

function nextNumber(prefix: string, list: { [k: string]: string }[]): string {
  const key = prefix === "Q-" ? "quoteNumber" : "invoiceNumber";
  let max = 0;
  for (const item of list) {
    const m = (item[key] || "").match(/(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export function useQuotations() {
  const [quotations, set] = useStore<Quotation[]>(KEYS.quotations, []);
  return {
    quotations,
    saveQuotation: (q: Omit<Quotation, "id" | "quoteNumber" | "createdAt"> & { id?: string; quoteNumber?: string }) => {
      if (q.id) {
        set(quotations.map((x) => x.id === q.id ? { ...(x as Quotation), ...q } as Quotation : x));
        return quotations.find((x) => x.id === q.id)!;
      }
      const newQ: Quotation = {
        ...q, id: crypto.randomUUID(),
        quoteNumber: nextNumber("Q-", quotations),
        createdAt: new Date().toISOString(),
      };
      set([newQ, ...quotations]);
      return newQ;
    },
    removeQuotation: (id: string) => set(quotations.filter((q) => q.id !== id)),
  };
}

export function useInvoices() {
  const [invoices, set] = useStore<Invoice[]>(KEYS.invoices, []);
  return {
    invoices,
    saveInvoice: (i: Omit<Invoice, "id" | "invoiceNumber" | "createdAt"> & { id?: string; invoiceNumber?: string }) => {
      if (i.id) {
        set(invoices.map((x) => x.id === i.id ? { ...(x as Invoice), ...i } as Invoice : x));
        return invoices.find((x) => x.id === i.id)!;
      }
      const newI: Invoice = {
        ...i, id: crypto.randomUUID(),
        invoiceNumber: nextNumber("INV-", invoices),
        createdAt: new Date().toISOString(),
      };
      set([newI, ...invoices]);
      return newI;
    },
    updateInvoiceStatus: (id: string, status: Invoice["paymentStatus"], amountPaid?: number) => {
      set(invoices.map((x) => x.id === id ? { ...x, paymentStatus: status, amountPaidUsd: amountPaid ?? x.amountPaidUsd } : x));
    },
    removeInvoice: (id: string) => set(invoices.filter((i) => i.id !== id)),
  };
}

// ---- PDF generation
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getSettings } from "@/lib/admin-data";
import { fmtUsd, fmtZwl } from "@/data/products";

function fmtDate(iso: string) { try { return new Date(iso).toLocaleDateString("en-GB"); } catch { return iso; } }

export function downloadQuotationPdf(q: Quotation) {
  generateDocPdf({ kind: "QUOTATION", number: q.quoteNumber, date: q.createdAt,
    customer: { name: q.customerName, contact: q.customerContact, email: q.customerEmail, vat: q.customerVat, tin: q.customerTin },
    items: q.items, subtotal: q.subtotalUsd, total: q.totalUsd,
    footer: `This quotation is valid until ${fmtDate(q.validUntil)}. Thank you for your business.`,
    notes: q.notes, showPayment: false,
  });
}

export function downloadInvoicePdf(i: Invoice) {
  generateDocPdf({ kind: "INVOICE", number: i.invoiceNumber, date: i.createdAt,
    customer: { name: i.customerName, contact: i.customerContact, email: i.customerEmail, vat: i.customerVat, tin: i.customerTin },
    items: i.items, subtotal: i.subtotalUsd, total: i.totalUsd,
    footer: `Payment status: ${i.paymentStatus.toUpperCase()}${i.paymentStatus === "partial" ? ` — Balance: ${fmtUsd(i.totalUsd - i.amountPaidUsd)}` : ""}`,
    showPayment: true,
  });
}

interface DocPdfInput {
  kind: "QUOTATION" | "INVOICE";
  number: string;
  date: string;
  customer: { name: string; contact: string; email: string; vat: string; tin: string };
  items: DocItem[];
  subtotal: number;
  total: number;
  notes?: string;
  footer: string;
  showPayment: boolean;
}

function generateDocPdf(input: DocPdfInput) {
  const s = getSettings();
  const doc = new jsPDF();
  const NAVY: [number, number, number] = [41, 61, 155];

  // Header
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("STATIONERY CITY", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Shop R4 Main Street Mall, Between 14th & 15th Ave", 14, 20);
  doc.text("J. Nkomo Street, Bulawayo · +263 77 409 8174 / +263 77 586 3002", 14, 25);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(input.kind, 196, 15, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`No: ${input.number}`, 196, 22, { align: "right" });
  doc.text(`Date: ${fmtDate(input.date)}`, 196, 27, { align: "right" });

  doc.setTextColor(30, 30, 30);
  let y = 40;
  if (s.vatNumber) { doc.setFontSize(8); doc.text(`VAT: ${s.vatNumber}`, 14, y); y += 4; }
  if (s.tin) { doc.setFontSize(8); doc.text(`TIN: ${s.tin}`, 14, y); y += 4; }
  if (s.vatNumber || s.tin) y += 2;

  // Bill To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BILL TO", 14, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(input.customer.name || "-", 14, y); y += 4;
  if (input.customer.contact) { doc.text(input.customer.contact, 14, y); y += 4; }
  if (input.customer.email) { doc.text(input.customer.email, 14, y); y += 4; }
  if (input.customer.vat) { doc.text(`VAT: ${input.customer.vat}`, 14, y); y += 4; }
  if (input.customer.tin) { doc.text(`TIN: ${input.customer.tin}`, 14, y); y += 4; }

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["#", "Description", "Qty", "Unit Price (USD)", "Total (USD)"]],
    body: input.items.map((it, idx) => [
      String(idx + 1), it.description, String(it.qty), fmtUsd(it.unitPriceUsd), fmtUsd(it.total),
    ]),
    headStyles: { fillColor: NAVY, textColor: 255 },
    styles: { fontSize: 9 },
  });

  // @ts-expect-error - autoTable adds property
  let afterY = (doc.lastAutoTable?.finalY ?? y) + 8;

  doc.setFontSize(10);
  doc.text(`Subtotal: ${fmtUsd(input.subtotal)} (${fmtZwl(input.subtotal, s.usdToZwlRate)})`, 196, afterY, { align: "right" });
  afterY += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: ${fmtUsd(input.total)} (${fmtZwl(input.total, s.usdToZwlRate)})`, 196, afterY, { align: "right" });
  afterY += 10;
  doc.setFont("helvetica", "normal");

  if (input.notes) {
    doc.setFontSize(9);
    doc.text(`Notes: ${input.notes}`, 14, afterY);
    afterY += 8;
  }

  if (input.showPayment && (s.bankName || s.ecocashNumber)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("PAYMENT DETAILS", 14, afterY); afterY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (s.bankName) { doc.text(`Bank: ${s.bankName}${s.branch ? " — " + s.branch : ""}`, 14, afterY); afterY += 4; }
    if (s.accountName) { doc.text(`Account Name: ${s.accountName}`, 14, afterY); afterY += 4; }
    if (s.accountNumber) { doc.text(`Account Number: ${s.accountNumber}`, 14, afterY); afterY += 4; }
    if (s.ecocashNumber) { doc.text(`EcoCash: ${s.ecocashNumber}`, 14, afterY); afterY += 4; }
    afterY += 4;
  }

  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text(input.footer, 14, 285);

  doc.save(`${input.kind === "QUOTATION" ? "Quotation" : "Invoice"}-${input.number}.pdf`);
}