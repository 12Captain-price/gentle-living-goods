export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  heroImage?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  price: number;
  description: string;
  longDescription: string;
  materials: string;
  dimensions?: string;
  images: string[];
  featured?: boolean;
  new?: boolean;
  stock: number;
  salePrice?: number;
  saleEndDate?: string;
}

export const DEFAULT_ZWL_RATE = 27000;

export function fmtUsd(n: number) {
  return `$${n.toFixed(2)}`;
}

export function fmtZwl(usd: number, rate = DEFAULT_ZWL_RATE) {
  return `ZWL ${(usd * rate).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function stockStatus(stock: number): { label: string; tone: "in" | "low" | "out" } {
  if (stock === 0) return { label: "Out of stock", tone: "out" };
  if (stock <= 5) return { label: `Low stock — ${stock} left`, tone: "low" };
  return { label: "In stock", tone: "in" };
}

export const collections: Collection[] = [
  { id: "writing", name: "Pens & Writing", slug: "writing", description: "Fine pens, pencils and markers for every hand", image: "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=1920&q=80" },
  { id: "notebooks", name: "Notebooks & Books", slug: "notebooks", description: "Bound pages waiting for ideas, notes and plans", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1920&q=80" },
  { id: "office", name: "Office Supplies", slug: "office", description: "Everyday essentials that keep the workday moving", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80" },
  { id: "school", name: "School Supplies", slug: "school", description: "Everything students need, from first grade to final year", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80" },
  { id: "art", name: "Art & Craft", slug: "art", description: "Colours, brushes and papers for the creative mind", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80" },
  { id: "files", name: "Files & Folders", slug: "files", description: "Organise, archive and carry your paperwork with ease", image: "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1920&q=80" },
  { id: "printing", name: "Printing & Paper", slug: "printing", description: "Reams, cards and specialty papers for every project", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1920&q=80" },
  { id: "ict", name: "ICT Accessories", slug: "ict", description: "USBs, mice, cables and everyday computer accessories", image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80", heroImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1920&q=80" },
];

const IMG = {
  pen1: "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80",
  pen2: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
  hi: "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=800&q=80",
  nb1: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
  nb2: "https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=800&q=80",
  office1: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
  office2: "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80",
  school1: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  school2: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
  bag: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  art1: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
  paper: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
  ream: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  usb: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
  mouse: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80",
};

export const products: Product[] = [
  { id: "parker-jotter", name: "Parker Jotter Ballpoint Pen", slug: "parker-jotter-ballpoint-pen", collection: "writing", price: 18, stock: 8,
    description: "The iconic stainless steel ballpoint, made to last",
    longDescription: "A modern classic since 1954, the Parker Jotter writes with confident, smooth ink flow.",
    materials: "Stainless steel barrel, refillable ballpoint", images: [IMG.pen1, IMG.pen2] },
  { id: "bic-cristal", name: "BIC Cristal Pens Pack of 10", slug: "bic-cristal-pens", collection: "writing", price: 4, stock: 42,
    description: "The world's favourite everyday ballpoint",
    longDescription: "Reliable, affordable and always ready. Bulk pack of ten for classrooms and offices.",
    materials: "Transparent barrel, tungsten carbide ball tip", images: [IMG.pen2, IMG.pen1] },
  { id: "staedtler-highlighters", name: "Staedtler Highlighters 6-pack", slug: "staedtler-highlighters", collection: "writing", price: 5.75, stock: 24,
    description: "Vivid fluorescent highlighters — pack of six",
    longDescription: "Chisel tip highlighters in six bold colours, ideal for study notes and quick file marking.",
    materials: "Chisel tip, water-based ink", images: [IMG.hi, IMG.pen1] },
  { id: "pilot-g2", name: "Pilot G2 Gel Pen", slug: "pilot-g2-gel-pen", collection: "writing", price: 2.20, stock: 0,
    description: "Smooth-flowing retractable gel pen",
    longDescription: "The much-loved G2 gel pen, 0.7mm — comfortable rubber grip and rich, smooth ink.",
    materials: "Retractable, gel ink 0.7mm", images: [IMG.pen1, IMG.pen2] },
  { id: "a4-spiral-200", name: "A4 Spiral Notebook 200pg", slug: "a4-spiral-notebook-200pg", collection: "notebooks", price: 4.50, stock: 38, featured: true,
    description: "Wire-bound A4 notebook, 200 feint-ruled pages",
    longDescription: "Sturdy wire binding lets pages lie flat. 200 pages of feint-ruled 60gsm paper.",
    materials: "Wire-o binding, 60gsm paper", images: [IMG.nb1, IMG.nb2] },
  { id: "moleskine-classic", name: "Moleskine Classic Notebook", slug: "moleskine-classic-notebook", collection: "notebooks", price: 22, stock: 6, salePrice: 18,
    description: "The legendary hardcover journal",
    longDescription: "Hardcover, rounded corners, elastic closure, expandable inner pocket. 240 ivory pages.",
    materials: "Hardcover, acid-free ivory paper", dimensions: "A5 — 13cm × 21cm", images: [IMG.nb2, IMG.nb1] },
  { id: "a4-counter-book", name: "A4 Hardcover Counter Book", slug: "a4-counter-book", collection: "notebooks", price: 8, stock: 15,
    description: "Sturdy 288-page counter book for daily records",
    longDescription: "The workhorse for shops and workshops. Reinforced hardcover, stitched binding.",
    materials: "Hardcover, 60gsm ruled paper", dimensions: "A4", images: [IMG.nb2, IMG.nb1] },
  { id: "exercise-books-12", name: "Exercise Books Pack of 12", slug: "exercise-books-pack-12", collection: "notebooks", price: 6.80, stock: 4,
    description: "72-page A5 exercise books, pack of 12",
    longDescription: "The school essential. Twelve A5 exercise books with sugar-paper covers.",
    materials: "72 pages, feint & margin", images: [IMG.nb1, IMG.nb2] },
  { id: "rexel-stapler", name: "Rexel Heavy-Duty Stapler", slug: "rexel-heavy-duty-stapler", collection: "office", price: 9.50, stock: 11, featured: true,
    description: "Full-strip stapler up to 25 sheets",
    longDescription: "Trusted metal-body desktop stapler. Non-slip base. Loads full strip 26/6.",
    materials: "Steel body, rubber base", images: [IMG.office1, IMG.office2] },
  { id: "sellotape", name: "Sellotape Original Clear Tape", slug: "sellotape-original", collection: "office", price: 3, stock: 30,
    description: "Clear tape that lifts cleanly and holds firmly",
    longDescription: "The genuine article. Goes on clear, tears easily.",
    materials: "Polypropylene film", dimensions: "24mm × 33m", images: [IMG.office2, IMG.office1] },
  { id: "scissors-steel", name: "Scissors Stainless Steel", slug: "scissors-stainless-steel", collection: "office", price: 3.50, stock: 12, salePrice: 2.50,
    description: "8-inch stainless steel office scissors",
    longDescription: "Comfortable moulded handles and sharp stainless blades.",
    materials: "Stainless steel blades, ABS handles", images: [IMG.office1, IMG.office2] },
  { id: "oxford-maths-set", name: "Oxford Mathematical Set", slug: "oxford-maths-set", collection: "school", price: 6, stock: 20, new: true,
    description: "Complete geometry kit in a hinged tin",
    longDescription: "Metal compass, protractor, ruler, set squares, pencil, eraser and sharpener.",
    materials: "Metal & polystyrene instruments, tin case", images: [IMG.school1, IMG.school2] },
  { id: "school-backpack", name: "Classic School Backpack", slug: "classic-school-backpack", collection: "school", price: 32, stock: 9,
    description: "Padded, water-resistant bag for the school run",
    longDescription: "Padded shoulder straps, reinforced base, padded laptop sleeve, side pockets.",
    materials: "Water-resistant polyester", dimensions: "30cm × 45cm × 15cm", images: [IMG.bag, IMG.school1] },
  { id: "faber-castell-24", name: "Faber-Castell Colour Pencils 24pk", slug: "faber-castell-colour-pencils", collection: "art", price: 14, stock: 22, featured: true,
    description: "Rich, blendable colour for young and serious artists",
    longDescription: "24 vibrant break-resistant pencils in a hinged tin. Pre-sharpened.",
    materials: "Cedar wood casing, wax-based cores", images: [IMG.art1, IMG.school2] },
  { id: "a3-sketch-pad", name: "A3 Cartridge Sketch Pad", slug: "a3-cartridge-sketch-pad", collection: "art", price: 12, stock: 5,
    description: "160gsm paper for pencil, ink and light washes",
    longDescription: "50 sheets of acid-free heavyweight cartridge paper. Wire-bound at the top.",
    materials: "160gsm cartridge paper, 50 sheets", dimensions: "A3", images: [IMG.school2, IMG.art1] },
  { id: "lever-arch-file", name: "A4 Lever Arch File", slug: "a4-lever-arch-file", collection: "files", price: 5, stock: 40,
    description: "70mm capacity file with reinforced spine",
    longDescription: "The office standard for archiving. Sprung lever mechanism, holds 500 sheets.",
    materials: "Laminated board, metal mechanism", dimensions: "A4 — 70mm spine", images: [IMG.office2, IMG.office1] },
  { id: "manilla-folders-25", name: "Manilla Folders Pack of 25", slug: "manilla-folders-pack", collection: "files", price: 9, stock: 18,
    description: "Classic buff folders for everyday filing",
    longDescription: "25 foolscap buff folders with a scored spine for expansion.",
    materials: "170gsm manilla card", dimensions: "Foolscap", images: [IMG.ream, IMG.office2] },
  { id: "a4-copy-ream", name: "A4 Copy Paper 500 Sheet Ream", slug: "a4-copy-paper-ream", collection: "printing", price: 7, stock: 60, featured: true, new: true,
    description: "Bright white 80gsm paper for printers & copiers",
    longDescription: "Crisp, jam-free ream engineered for laser, inkjet and copiers.",
    materials: "80gsm bright white bond paper, 500 sheets", dimensions: "A4", images: [IMG.paper, IMG.ream] },
  { id: "usb-64gb", name: "USB Flash Drive 64GB", slug: "usb-flash-drive-64gb", collection: "ict", price: 11, stock: 18,
    description: "Reliable USB 3.0 flash drive — 64GB",
    longDescription: "Fast USB 3.0 transfer speeds. Retractable capless design.",
    materials: "USB 3.0, 64GB", images: [IMG.usb, IMG.office1] },
  { id: "wireless-mouse-logitech", name: "Wireless Mouse Logitech", slug: "wireless-mouse-logitech", collection: "ict", price: 14.50, stock: 7,
    description: "Compact wireless mouse with USB receiver",
    longDescription: "Plug-and-play wireless mouse with 12-month battery life.",
    materials: "2.4GHz wireless, AA battery", images: [IMG.mouse, IMG.usb] },
];

export const getProductsByCollection = (slug: string) => products.filter((p) => p.collection === slug);
export const getFeaturedProducts = () => products.filter((p) => p.featured);
export const getNewProducts = () => products.filter((p) => p.new);
export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getCollectionBySlug = (slug: string) => collections.find((c) => c.slug === slug);
export const getRelatedProducts = (productId: string, limit = 4) => {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return products.filter((p) => p.collection === product.collection && p.id !== productId).slice(0, limit);
};