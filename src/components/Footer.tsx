import { Link } from "react-router-dom";
import { Editable } from "@/lib/site-content";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-full py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Stationery City — Stationery, Office & ICT Solutions"
                className="h-12 md:h-16 w-auto"
              />
            </Link>
            <div className="mt-6 text-sm text-background/60 leading-relaxed max-w-sm">
              <Editable k="footer.tagline" defaultValue="Bulawayo's home for pens, paper and everything in between." className="block mb-3" />
              <span className="block">
                Shop R4 Main Street Mall, Between 14th And 15th Ave,<br />
                J. Nkomo Street, Bulawayo
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-background/60 hover:text-background transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-background/60 hover:text-background transition-colors">Shop</Link></li>
              <li><Link to="/about" className="text-background/60 hover:text-background transition-colors">About</Link></li>
              <li><Link to="/returns" className="text-background/60 hover:text-background transition-colors">Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-background/40 mb-5">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:+263774098174" className="font-mono text-background/60 hover:text-background transition-colors">+263 77 409 8174</a></li>
              <li><a href="tel:+263775863002" className="font-mono text-background/60 hover:text-background transition-colors">+263 77 586 3002</a></li>
              <li><a href="mailto:stationerycitybyo@gmail.com" className="text-background/60 hover:text-background transition-colors break-all">stationerycitybyo@gmail.com</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container-full py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-background/40">© 2025 Stationery City. All rights reserved.</p>
          <Link to="/admin/login" className="text-[10px] tracking-[0.25em] uppercase text-background/30 hover:text-background/70">Staff</Link>
        </div>
      </div>
    </footer>
  );
};