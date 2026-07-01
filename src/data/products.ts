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
}

export const collections: Collection[] = [
  {
    id: "writing",
    name: "Pens & Writing",
    slug: "writing",
    description: "Fine pens, pencils and markers for every hand",
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=1920&q=80",
  },
  {
    id: "notebooks",
    name: "Notebooks & Journals",
    slug: "notebooks",
    description: "Bound pages waiting for ideas, notes and plans",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1920&q=80",
  },
  {
    id: "office",
    name: "Office Supplies",
    slug: "office",
    description: "Everyday essentials that keep the workday moving",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80",
  },
  {
    id: "school",
    name: "School Supplies",
    slug: "school",
    description: "Everything students need, from first grade to final year",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80",
  },
  {
    id: "art",
    name: "Art & Craft",
    slug: "art",
    description: "Colours, brushes and papers for the creative mind",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80",
  },
  {
    id: "files",
    name: "Files & Folders",
    slug: "files",
    description: "Organise, archive and carry your paperwork with ease",
    image: "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1920&q=80",
  },
  {
    id: "printing",
    name: "Printing & Paper",
    slug: "printing",
    description: "Reams, cards and specialty papers for every project",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1920&q=80",
  },
  {
    id: "gifts",
    name: "Cards & Gifts",
    slug: "gifts",
    description: "Greeting cards and thoughtful gifts for every occasion",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&q=80",
  },
];

export const products: Product[] = [
  // Pens & Writing
  {
    id: "parker-jotter",
    name: "Parker Jotter Ballpoint Pen",
    slug: "parker-jotter-ballpoint-pen",
    collection: "writing",
    price: 18,
    description: "The iconic stainless steel ballpoint, made to last",
    longDescription: "A modern classic since 1954, the Parker Jotter writes with confident, smooth ink flow. Its polished stainless steel barrel and signature arrow clip make it a professional's everyday companion — perfect for the office, university lectures or the boardroom.",
    materials: "Stainless steel barrel, refillable ballpoint",
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80",
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "bic-cristal-pack",
    name: "BIC Cristal Pens — Pack of 10",
    slug: "bic-cristal-pens",
    collection: "writing",
    price: 4,
    description: "The world's favourite everyday ballpoint",
    longDescription: "Reliable, affordable and always ready. The BIC Cristal is a classroom and office staple, delivering clean, consistent lines every time. Comes in a bulk pack of ten — perfect for stocking a study desk, reception or workshop.",
    materials: "Transparent barrel, tungsten carbide ball tip",
    images: [
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      "https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80",
    ],
  },
  // Notebooks & Journals
  {
    id: "moleskine-classic",
    name: "Moleskine Classic Notebook",
    slug: "moleskine-classic-notebook",
    collection: "notebooks",
    price: 22,
    description: "The legendary hardcover journal for ideas that matter",
    longDescription: "Bound in soft, wipe-clean hardcover with rounded corners, an elastic closure and an expandable inner pocket, the Moleskine Classic is trusted by writers, designers and thinkers worldwide. Ivory pages accept every kind of ink beautifully.",
    materials: "Hardcover, acid-free ivory paper, 240 pages",
    dimensions: "A5 — 13cm × 21cm",
    images: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
      "https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "a4-counter-book",
    name: "A4 Hardcover Counter Book",
    slug: "a4-counter-book",
    collection: "notebooks",
    price: 8,
    description: "Sturdy 288-page counter book for daily records",
    longDescription: "A workhorse for shops, workshops and offices across Bulawayo. The reinforced hardcover and stitched binding keep your records safe for years. Feint-ruled and margined for tidy bookkeeping, inventory logs and meeting notes.",
    materials: "Hardcover, 60gsm ruled paper, 288 pages",
    dimensions: "A4 — 21cm × 30cm",
    images: [
      "https://images.unsplash.com/photo-1517971071642-34a2d3ecc9cd?w=800&q=80",
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
    ],
  },
  // Office Supplies
  {
    id: "rexel-stapler",
    name: "Rexel Heavy-Duty Stapler",
    slug: "rexel-heavy-duty-stapler",
    collection: "office",
    price: 24,
    description: "Full-strip stapler that handles up to 25 sheets",
    longDescription: "A trusted desktop stapler with a full metal chassis and non-slip base. Loads a full strip of 26/6 staples and glides through 25 sheets without jams — a reliable partner for busy reception desks, print rooms and study groups.",
    materials: "Steel body, rubber base",
    images: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
      "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "sellotape-original",
    name: "Sellotape Original Clear Tape",
    slug: "sellotape-original",
    collection: "office",
    price: 3,
    description: "The clear tape that lifts cleanly and holds firmly",
    longDescription: "The genuine article. Sellotape Original goes on clear, tears easily and stays where you put it — perfect for wrapping, sealing envelopes, mending pages and last-minute poster fixes.",
    materials: "Polypropylene film, solvent-free adhesive",
    dimensions: "24mm × 33m",
    images: [
      "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
    ],
  },
  // School Supplies
  {
    id: "oxford-maths-set",
    name: "Oxford Mathematical Instruments Set",
    slug: "oxford-maths-set",
    collection: "school",
    price: 6,
    description: "Everything for geometry class in one tin",
    longDescription: "The complete school geometry kit: metal compass, protractor, 15cm ruler, set squares, pencil, eraser and sharpener — all in a durable hinged tin. A back-to-school essential for primary and secondary learners.",
    materials: "Metal & polystyrene instruments, tin case",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    ],
    new: true,
  },
  {
    id: "school-backpack",
    name: "Classic School Backpack",
    slug: "classic-school-backpack",
    collection: "school",
    price: 32,
    description: "Padded, water-resistant bag built for the school run",
    longDescription: "A hard-wearing backpack with padded shoulder straps, a reinforced base and a padded laptop sleeve. Roomy enough for A4 books, lunch box and PE kit — with side pockets for a water bottle and umbrella.",
    materials: "Water-resistant polyester, padded straps",
    dimensions: "30cm × 45cm × 15cm",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    ],
  },
  // Art & Craft
  {
    id: "faber-castell-pencils",
    name: "Faber-Castell Colour Pencils — 24 Pack",
    slug: "faber-castell-colour-pencils",
    collection: "art",
    price: 14,
    description: "Rich, blendable colour for young and serious artists",
    longDescription: "A palette of 24 vibrant, break-resistant pencils in a sturdy hinged tin. Pre-sharpened and ready to work — ideal for school art projects, adult colouring and detailed illustration alike.",
    materials: "Cedar wood casing, wax-based colour cores",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    ],
    featured: true,
  },
  {
    id: "a3-sketch-pad",
    name: "A3 Cartridge Sketch Pad",
    slug: "a3-cartridge-sketch-pad",
    collection: "art",
    price: 12,
    description: "160gsm paper for pencil, ink and light washes",
    longDescription: "Fifty sheets of heavyweight, acid-free cartridge paper with a subtle tooth — perfect for sketching, technical drawing and light watercolour work. Wire-bound at the top so pages lie flat.",
    materials: "Acid-free 160gsm cartridge paper, 50 sheets",
    dimensions: "A3 — 30cm × 42cm",
    images: [
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    ],
  },
  // Files & Folders
  {
    id: "lever-arch-file",
    name: "A4 Lever Arch File",
    slug: "a4-lever-arch-file",
    collection: "files",
    price: 5,
    description: "70mm capacity file with reinforced spine",
    longDescription: "The office standard for archiving. A rigid board cover with a wipe-clean laminated finish, sprung lever mechanism and finger-pull hole for easy shelving. Holds up to 500 sheets.",
    materials: "Laminated board, metal mechanism",
    dimensions: "A4 — 70mm spine",
    images: [
      "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
    ],
  },
  {
    id: "manilla-folders",
    name: "Manilla Folders — Pack of 25",
    slug: "manilla-folders-pack",
    collection: "files",
    price: 9,
    description: "Classic buff folders for everyday filing",
    longDescription: "Twenty-five foolscap buff folders with a scored spine for expansion. Compatible with standard suspension files and drawer cabinets — a simple, tidy way to keep paperwork in order.",
    materials: "170gsm manilla card",
    dimensions: "Foolscap — 35cm × 24cm",
    images: [
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
      "https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=800&q=80",
    ],
  },
  // Printing & Paper
  {
    id: "a4-paper-ream",
    name: "A4 Copy Paper — 500 Sheet Ream",
    slug: "a4-copy-paper-ream",
    collection: "printing",
    price: 7,
    description: "Bright white 80gsm paper for printers & copiers",
    longDescription: "A crisp, jam-free ream engineered for laser and inkjet printers, copiers and fax machines. Sharp text, vivid colour and a smooth finish — the daily paper for offices, schools and print shops.",
    materials: "80gsm bright white bond paper, 500 sheets",
    dimensions: "A4 — 210mm × 297mm",
    images: [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    ],
    new: true,
  },
  // Cards & Gifts
  {
    id: "greeting-card",
    name: "Handwritten-Style Greeting Card",
    slug: "handwritten-greeting-card",
    collection: "gifts",
    price: 3,
    description: "Elegant blank cards for any occasion",
    longDescription: "A textured, uncoated card with a soft-touch feel, ready for your own message. Comes with a matching kraft envelope, sealed in a clear sleeve — perfect for birthdays, thank-yous and quiet gestures.",
    materials: "300gsm textured card, kraft envelope",
    dimensions: "A6 — 10.5cm × 14.8cm",
    images: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    ],
  },
];

export const getProductsByCollection = (collectionSlug: string): Product[] => {
  return products.filter((product) => product.collection === collectionSlug);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((product) => product.featured);
};

export const getNewProducts = (): Product[] => {
  return products.filter((product) => product.new);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((product) => product.slug === slug);
};

export const getCollectionBySlug = (slug: string): Collection | undefined => {
  return collections.find((collection) => collection.slug === slug);
};

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  
  return products
    .filter((p) => p.collection === product.collection && p.id !== productId)
    .slice(0, limit);
};
