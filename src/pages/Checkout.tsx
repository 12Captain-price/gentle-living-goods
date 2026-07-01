import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/hooks/useCart";
import { useCartMeta } from "@/hooks/useCartMeta";
import { useSettings, useZones, findCoupon, computeCouponDiscount } from "@/lib/admin-data";
import { fmtUsd, fmtZwl } from "@/data/products";
import { Button } from "@/components/ui/button";

const Checkout = () => {
  const { items, getSubtotal, clearCart } = useCart();
  const meta = useCartMeta();
  const { settings } = useSettings();
  const { zones } = useZones();
  const rate = settings.usdToZwlRate;
  const [sent, setSent] = useState(false);

  const subtotal = getSubtotal();
  const coupon = meta.couponCode ? findCoupon(meta.couponCode) : undefined;
  const discount = computeCouponDiscount(coupon, subtotal);
  const zone = meta.deliveryMethod === "delivery" && meta.zoneId ? zones.find((z) => z.id === meta.zoneId) : undefined;
  const deliveryFee = zone?.feeUsd ?? 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const orderRef = useMemo(() => `SC-${Math.floor(1000 + Math.random() * 9000)}`, []);

  const buildMessage = () => {
    const lines: string[] = [];
    lines.push("🛒 *STATIONERY CITY ORDER*");
    lines.push(`Order Ref: ${orderRef}`);
    lines.push("");
    for (const it of items) {
      const p = it.product.salePrice ?? it.product.price;
      lines.push(`${it.product.name} x${it.quantity} — ${fmtUsd(p * it.quantity)}`);
    }
    lines.push("");
    lines.push(`Subtotal: ${fmtUsd(subtotal)} (${fmtZwl(subtotal, rate)})`);
    if (meta.deliveryMethod === "delivery" && zone) {
      lines.push(`Delivery: ${zone.name} — ${fmtUsd(zone.feeUsd)}`);
    } else {
      lines.push(`Delivery: Pickup from shop — Free`);
    }
    if (coupon && discount > 0) {
      lines.push(`Coupon: ${coupon.code} -${fmtUsd(discount)}`);
    }
    lines.push(`*TOTAL: ${fmtUsd(total)} (${fmtZwl(total, rate)})*`);
    lines.push("");
    lines.push(meta.deliveryMethod === "delivery" && zone ? `📍 Delivery to: ${zone.name}` : "📍 Pickup from shop");
    lines.push("");
    lines.push("Sent via Stationery City Bulawayo");
    return lines.join("\n");
  };

  const sendTo = (number: string) => {
    const url = `https://wa.me/${number}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank");
    clearCart();
    meta.reset();
    setSent(true);
  };

  if (sent) {
    return (
      <Layout>
        <div className="container-narrow py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <Check className="w-8 h-8 text-green-700" />
          </div>
          <h1 className="font-serif text-4xl mb-4">Order sent!</h1>
          <p className="text-muted-foreground mb-8">We've received your WhatsApp order. We'll confirm shortly and arrange payment or delivery.</p>
          <Button asChild size="lg" className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase bg-navy hover:bg-navy/90">
            <Link to="/products">Back to Shop</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-narrow py-28 text-center">
          <h1 className="font-serif text-4xl mb-4">Your Bag is Empty</h1>
          <Button asChild className="rounded-none px-8 text-sm tracking-[0.1em] uppercase mt-4">
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-full py-6 border-b border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/cart" className="hover:text-foreground">Your Bag</Link>
          <span className="text-border">/</span>
          <span className="text-foreground">Checkout</span>
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container-full">
          <h1 className="font-serif text-4xl md:text-5xl mb-12">Checkout</h1>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Review */}
            <div className="lg:col-span-7">
              <h2 className="font-serif text-2xl mb-6">Order Review</h2>
              <div className="border border-border">
                {items.map((it) => {
                  const p = it.product.salePrice ?? it.product.price;
                  return (
                    <div key={it.product.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
                      <img src={it.product.images[0]} alt="" className="w-14 h-14 object-cover" />
                      <div className="flex-1">
                        <p className="font-serif">{it.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {it.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">{fmtUsd(p * it.quantity)}</p>
                        <p className="font-mono text-[10px] text-muted-foreground/70">{fmtZwl(p * it.quantity, rate)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{meta.deliveryMethod === "delivery" && zone ? `${zone.name} — ${fmtUsd(zone.feeUsd)}` : "Pickup from shop — Free"}</span></div>
                {coupon && discount > 0 && (
                  <div className="flex justify-between text-green-700"><span>Coupon ({coupon.code})</span><span className="font-mono">-{fmtUsd(discount)}</span></div>
                )}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-serif text-xl">Total</span>
                  <div className="text-right">
                    <div className="font-mono text-xl text-navy">{fmtUsd(total)}</div>
                    <div className="font-mono text-xs text-muted-foreground">{fmtZwl(total, rate)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp send */}
            <div className="lg:col-span-5">
              <div className="bg-linen p-8 lg:sticky lg:top-28">
                <h2 className="font-serif text-2xl mb-2">Send order via WhatsApp</h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Your order summary will be sent as a WhatsApp message. We'll confirm and arrange payment or delivery.
                </p>
                <div className="mb-6 font-mono text-xs bg-background p-3">Order Ref: <span className="font-medium">{orderRef}</span></div>
                <div className="space-y-3">
                  <Button onClick={() => sendTo(settings.whatsapp1)} className="w-full rounded-none py-6 text-sm tracking-[0.15em] uppercase bg-navy hover:bg-navy/90 text-white">
                    Send to Number 1 (+263 77 409 8174)
                  </Button>
                  <Button onClick={() => sendTo(settings.whatsapp2)} className="w-full rounded-none py-6 text-sm tracking-[0.15em] uppercase bg-gold hover:bg-gold/90 text-charcoal">
                    Send to Number 2 (+263 77 586 3002)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;