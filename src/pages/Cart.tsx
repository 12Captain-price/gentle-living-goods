import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2, Check, X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtUsd, fmtZwl } from "@/data/products";
import { useSettings, useZones, findCoupon, computeCouponDiscount, Coupon } from "@/lib/admin-data";
import { useCartMeta } from "@/hooks/useCartMeta";
import { cn } from "@/lib/utils";

const Cart = () => {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();
  const { settings } = useSettings();
  const { zones } = useZones();
  const rate = settings.usdToZwlRate;
  const meta = useCartMeta();

  const [couponInput, setCouponInput] = useState(meta.couponCode);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const activeCoupon: Coupon | undefined = meta.couponCode ? findCoupon(meta.couponCode) : undefined;
  const discount = computeCouponDiscount(activeCoupon, subtotal);

  const selectedZone = meta.zoneId ? zones.find((z) => z.id === meta.zoneId) : undefined;
  const deliveryFee = meta.deliveryMethod === "delivery" && selectedZone ? selectedZone.feeUsd : 0;

  const total = Math.max(0, subtotal - discount + deliveryFee);

  const applyCoupon = () => {
    setCouponError(null);
    const code = couponInput.trim();
    if (!code) { meta.setCoupon(""); return; }
    const found = findCoupon(code);
    if (!found) { setCouponError("Invalid or inactive coupon code"); meta.setCoupon(""); return; }
    meta.setCoupon(found.code);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-narrow py-28 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
          <h1 className="font-serif text-4xl mb-4">Your Bag is Empty</h1>
          <p className="text-muted-foreground mb-8">Add pens, notebooks and supplies to your bag to see them here.</p>
          <Button asChild size="lg" className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase">
            <Link to="/products">Start Shopping <ArrowRight className="ml-3 w-4 h-4" /></Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-full py-6 border-b border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-foreground">Shop</Link>
          <span className="text-border">/</span>
          <span className="text-foreground">Your Bag</span>
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container-full">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-4xl md:text-5xl mb-12">
            Your Bag
          </motion.h1>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Items */}
            <div className="lg:col-span-7">
              <div>
                {items.map((item) => {
                  const onSale = item.product.salePrice !== undefined && item.product.salePrice < item.product.price;
                  const price = onSale ? item.product.salePrice! : item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-6 py-6 border-b border-border">
                      <Link to={`/product/${item.product.slug}`} className="w-24 h-28 md:w-28 md:h-32 flex-shrink-0 overflow-hidden bg-muted/30">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 flex flex-col">
                        <Link to={`/product/${item.product.slug}`} className="font-serif text-lg hover:text-primary">
                          {item.product.name}
                        </Link>
                        <p className="font-mono text-sm text-navy mt-1">{fmtUsd(price)}</p>
                        <p className="font-mono text-[11px] text-muted-foreground/70">{fmtZwl(price, rate)}</p>
                        <div className="flex items-center justify-between mt-3">
                          <QuantitySelector quantity={item.quantity} onQuantityChange={(q) => updateQuantity(item.product.id, q)} />
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-sm text-foreground">{fmtUsd(price * item.quantity)}</span>
                            <button onClick={() => removeItem(item.product.id)} className="p-2 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="mt-8">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">Coupon Code</p>
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code"
                    className="rounded-none h-11 max-w-xs"
                  />
                  <Button onClick={applyCoupon} className="rounded-none h-11 px-6 text-xs tracking-[0.15em] uppercase">Apply</Button>
                </div>
                {activeCoupon && (
                  <p className="mt-2 text-sm text-green-700 flex items-center gap-1"><Check className="w-4 h-4" /> {activeCoupon.code} applied — {activeCoupon.discountType === "percentage" ? `${activeCoupon.value}% off` : `${fmtUsd(activeCoupon.value)} off`}</p>
                )}
                {couponError && (
                  <p className="mt-2 text-sm text-destructive flex items-center gap-1"><X className="w-4 h-4" /> {couponError}</p>
                )}
              </div>

              {/* Delivery */}
              <div className="mt-10">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">Delivery</p>
                <div className="space-y-3">
                  <label className={cn("flex items-center gap-3 p-4 border cursor-pointer", meta.deliveryMethod === "pickup" ? "border-navy bg-navy/5" : "border-border")}>
                    <input type="radio" checked={meta.deliveryMethod === "pickup"} onChange={() => meta.setDelivery("pickup", null)} />
                    <span className="flex-1 text-sm">Pickup from shop</span>
                    <span className="font-mono text-sm">Free</span>
                  </label>
                  <label className={cn("flex items-center gap-3 p-4 border cursor-pointer", meta.deliveryMethod === "delivery" ? "border-navy bg-navy/5" : "border-border")}>
                    <input type="radio" checked={meta.deliveryMethod === "delivery"} onChange={() => meta.setDelivery("delivery", meta.zoneId || zones[0]?.id)} />
                    <span className="text-sm">Delivery to</span>
                    <select
                      value={meta.zoneId ?? ""}
                      onChange={(e) => meta.setDelivery("delivery", e.target.value)}
                      className="flex-1 bg-transparent border-b border-border px-1 py-1 text-sm focus:outline-none"
                      disabled={meta.deliveryMethod !== "delivery"}
                    >
                      <option value="">Select suburb…</option>
                      {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    <span className="font-mono text-sm">
                      {selectedZone ? fmtUsd(selectedZone.feeUsd) : "—"}
                    </span>
                  </label>
                  {selectedZone && meta.deliveryMethod === "delivery" && (
                    <p className="font-mono text-[11px] text-muted-foreground text-right">{fmtZwl(selectedZone.feeUsd, rate)}</p>
                  )}
                </div>
              </div>

              <Link to="/products" className="inline-flex items-center gap-2 mt-8 text-sm tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground">
                <ArrowRight className="w-4 h-4 rotate-180" /> Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-5">
              <div className="bg-linen p-8 lg:sticky lg:top-28">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 text-sm">
                  <Row label="Subtotal" usd={subtotal} rate={rate} />
                  <Row label="Delivery" usd={deliveryFee} rate={rate} />
                  {discount > 0 && activeCoupon && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount ({activeCoupon.code})</span>
                      <span className="font-mono">-{fmtUsd(discount)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="font-serif text-xl">Total</span>
                    <div className="text-right">
                      <div className="font-mono text-2xl text-navy">{fmtUsd(total)}</div>
                      <div className="font-mono text-xs text-muted-foreground">{fmtZwl(total, rate)}</div>
                    </div>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full rounded-none py-6 text-sm tracking-[0.15em] uppercase bg-navy hover:bg-navy/90">
                  <Link to="/checkout">Proceed to Checkout <ArrowRight className="ml-3 w-4 h-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function Row({ label, usd, rate }: { label: string; usd: number; rate: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <div className="font-mono">{usd === 0 && label === "Delivery" ? "Free" : fmtUsd(usd)}</div>
        {usd > 0 && <div className="font-mono text-[10px] text-muted-foreground/70">{fmtZwl(usd, rate)}</div>}
      </div>
    </div>
  );
}

export default Cart;