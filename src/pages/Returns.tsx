import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/lib/admin-data";

const POLICY = [
  {
    title: "Eligibility",
    body: "Items can be returned within 7 days of purchase, provided they're unused, in their original packaging, and accompanied by a receipt or order reference.",
  },
  {
    title: "Non-Returnable Items",
    body: "Opened stationery consumables (ink, adhesives, cut-to-size paper) and clearance or sale items are final sale unless faulty.",
  },
  {
    title: "Faulty or Incorrect Items",
    body: "If you've received a faulty or incorrect item, we'll replace it or refund you in full — just reach out with your order details and a photo of the item.",
  },
  {
    title: "How Refunds Work",
    body: "Approved returns are refunded via the original payment method, or exchanged in-store at Shop R4, Main Street Mall, Bulawayo.",
  },
];

const Returns = () => {
  const { settings } = useSettings();
  const [orderRef, setOrderRef] = useState("");
  const [reason, setReason] = useState("");

  const message = [
    "Hi Stationery City, I'd like to request a return.",
    orderRef ? `Order reference: ${orderRef}` : null,
    reason ? `Reason: ${reason}` : null,
  ].filter(Boolean).join("\n");

  const sendReturnRequest = () => {
    const number = settings.whatsapp1;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-28 md:py-40 bg-linen">
        <div className="container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">
              Customer Care
            </p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-[0.95]">
              Returns &amp; Refunds
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We want you to be happy with every purchase. Here's how returns work at
              Stationery City.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Policy */}
      <section className="py-20 md:py-28">
        <div className="container-narrow">
          <div className="grid gap-10 md:gap-14">
            {POLICY.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="grid md:grid-cols-12 gap-4 md:gap-8 items-start border-b border-border pb-10"
              >
                <span className="md:col-span-2 text-[11px] font-semibold tracking-[0.3em] uppercase text-primary/60">
                  0{i + 1}
                </span>
                <h2 className="md:col-span-4 font-serif text-2xl text-foreground">
                  {item.title}
                </h2>
                <p className="md:col-span-6 text-muted-foreground leading-[1.8]">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp return request */}
      <section className="py-20 md:py-28 bg-linen">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-xl mx-auto text-center"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-4">
              Start A Return
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
              Request a Return on WhatsApp
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Add your order reference and a short note, and we'll pick it up from there.
            </p>
            <div className="grid gap-4 text-left mb-8">
              <Input
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="Order reference (optional)"
                className="rounded-none"
              />
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What would you like to return, and why?"
                className="rounded-none"
                rows={3}
              />
            </div>
            <Button
              onClick={sendReturnRequest}
              size="lg"
              className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase bg-navy hover:bg-navy/90 text-white"
            >
              <MessageCircle className="mr-3 w-4 h-4" />
              Message Us on WhatsApp
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Returns;
