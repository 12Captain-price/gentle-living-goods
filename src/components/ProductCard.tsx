import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Product, collections, fmtUsd, fmtZwl, stockStatus } from "@/data/products";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { useSettings } from "@/lib/admin-data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "large";
}

export const ProductCard = ({ product, index = 0, variant = "default" }: ProductCardProps) => {
  const { addItem: addWish, removeItem: removeWish, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const { settings } = useSettings();
  const { toast } = useToast();
  const inWishlist = isInWishlist(product.id);
  const collection = collections.find((c) => c.id === product.collection);
  const hasSecond = product.images.length > 1;
  const status = stockStatus(product.stock);
  const onSale = product.salePrice !== undefined && product.salePrice < product.price;
  const activePrice = onSale ? product.salePrice! : product.price;

  const wishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    inWishlist ? removeWish(product.id) : addWish(product);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (status.tone === "out") return;
    addToCart(product, 1);
    toast({ title: "Added to bag", description: product.name });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className={cn("relative overflow-hidden bg-muted/50 mb-5", variant === "large" ? "aspect-[3/4]" : "aspect-[4/5]")}>
          <img
            src={product.images[0]}
            alt={product.name}
            className={cn("w-full h-full object-cover transition-all duration-[1s] ease-out",
              hasSecond ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105")}
          />
          {hasSecond && (
            <img
              src={product.images[1]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 transition-all duration-[1s] ease-out group-hover:opacity-100 group-hover:scale-100"
            />
          )}

          {/* Badges top-left */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {onSale && (
              <span className="px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase bg-gold text-charcoal">
                Sale
              </span>
            )}
            {product.new && !onSale && (
              <span className="px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase bg-navy text-white">
                New
              </span>
            )}
            {product.featured && !onSale && !product.new && (
              <span className="px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase bg-primary text-primary-foreground">
                Featured
              </span>
            )}
          </div>

          <button
            onClick={wishlistToggle}
            className={cn("absolute top-4 right-4 p-2.5 rounded-full transition-all duration-500",
              "bg-background/90 backdrop-blur-md hover:bg-background shadow-sm",
              "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
              inWishlist && "opacity-100 translate-y-0")}
          >
            <Heart className={cn("w-4 h-4", inWishlist ? "fill-primary text-primary" : "text-foreground")} />
          </button>
        </div>

        <div className="space-y-2">
          {collection && (
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground/70">
              {collection.name}
            </p>
          )}
          <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-mono text-base font-medium text-navy tracking-tight">
              {fmtUsd(activePrice)}
            </span>
            {onSale && (
              <span className="font-mono text-sm text-muted-foreground/70 line-through">
                {fmtUsd(product.price)}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/70">
            {fmtZwl(activePrice, settings.usdToZwlRate)}
          </p>

          <div className="flex items-center justify-between gap-2 pt-3">
            <StockBadge tone={status.tone} label={status.label} />
            <button
              onClick={handleAdd}
              disabled={status.tone === "out"}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium tracking-[0.15em] uppercase transition-colors flex items-center gap-1.5",
                status.tone === "out"
                  ? "bg-muted text-muted-foreground/60 cursor-not-allowed"
                  : "bg-navy text-white hover:bg-navy/90",
              )}
            >
              <ShoppingBag className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

function StockBadge({ tone, label }: { tone: "in" | "low" | "out"; label: string }) {
  const cls = tone === "in"
    ? "bg-green-100 text-green-800"
    : tone === "low"
    ? "bg-amber-100 text-amber-800"
    : "bg-muted text-muted-foreground";
  const display = tone === "in" ? "In Stock" : tone === "low" ? label : "Out of Stock";
  return <span className={cn("inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide rounded-full", cls)}>{display}</span>;
}