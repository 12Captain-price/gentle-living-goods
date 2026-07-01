import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Editable } from "@/lib/site-content";

const About = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <Layout>
      {/* Hero — Full Viewport */}
      <section ref={heroRef} className="relative h-[80vh] md:h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&q=80"
            alt="Stationery City shop interior"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/10 to-charcoal/50" />
        </motion.div>

        <div className="relative container-full h-full flex flex-col justify-end pb-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/60 mb-5">
              <Editable k="about.hero.eyebrow" defaultValue="Our Story" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.9]">
              <Editable k="about.hero.headline" defaultValue="Bulawayo's Stationery Home" />
            </h1>
            <div className="text-base md:text-lg text-white/70 max-w-lg leading-relaxed">
              <Editable k="about.hero.subtext" defaultValue="Trusted pens, notebooks and office essentials — stocked with care at Shop R4, Main Street Mall." />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-28 md:py-40">
        <div className="container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="divider-ornament mb-12">
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary whitespace-nowrap">
                Our Philosophy
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.25] tracking-tight">
              We believe the right pen, the right notebook and the right file can
              make school easier, work sharper and ideas travel{" "}
              <span className="italic">further</span>.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Story — Large Image + Text */}
      <section className="pb-20 md:pb-32">
        <div className="container-full">
          {/* First story block */}
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center mb-24 md:mb-36">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">
                The Beginning
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-tight">
                A Shop Built for
                <br />
                <span className="italic">Bulawayo</span>
              </h3>
              <p className="text-muted-foreground leading-[1.8] mb-5">
                Stationery City opened its doors in the heart of Bulawayo's CBD
                to solve a simple problem: making trusted, quality stationery
                easy to find at fair prices. From a single counter in Main
                Street Mall, we've grown into a go-to shop for students,
                teachers, offices and small businesses across the city.
              </p>
              <p className="text-muted-foreground leading-[1.8]">
                Today our shelves carry everything from the humble BIC pen to
                full geometry sets, hardcover counter books, art supplies and
                reams of A4 paper — the everyday tools that keep classrooms,
                offices and workshops running.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="md:col-span-7 relative"
            >
              <div className="aspect-[4/5] overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1200&q=80"
                  alt="Neatly organised stationery on shop shelves"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>

          {/* Full-width banner image */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-24 md:mb-36"
          >
            <div className="relative h-[50vh] md:h-[70vh] overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1920&q=80"
                alt="An open notebook and pen"
                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="font-serif text-3xl md:text-5xl lg:text-6xl text-white text-center max-w-3xl px-6 leading-tight"
                >
                  "Great ideas
                  <br />
                  <span className="italic">start on paper</span>
                  <br />
                  and end in action"
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Second story block — reversed */}
          <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="md:col-span-7 md:order-first"
            >
              <div className="aspect-[4/5] overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80"
                  alt="Students preparing for school"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="md:col-span-5"
            >
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-5">
                Our Approach
              </p>
              <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-8 leading-tight">
                From Our Counter
                <br />
                <span className="italic">to Your Desk</span>
              </h3>
              <p className="text-muted-foreground leading-[1.8] mb-5">
                We only stock brands we would use ourselves — BIC, Parker,
                Faber-Castell, Moleskine, Rexel, Oxford and the local
                favourites you already know. Every item is checked over the
                counter before it leaves the shop.
              </p>
              <p className="text-muted-foreground leading-[1.8]">
                Whether you're kitting out a Grade 1 class, restocking a busy
                office or picking up a single notebook, you'll get honest
                advice, fair prices and stock you can rely on.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-36 bg-linen">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-primary mb-3">
              What Guides Us
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">
              Our Values
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-12 lg:gap-20">
            {[
              {
                title: "Quality Brands",
                number: "01",
                description:
                  "We stock the trusted names — BIC, Parker, Faber-Castell, Moleskine, Rexel and Oxford — alongside dependable local favourites. No knock-offs, no surprises.",
              },
              {
                title: "Fair Pricing",
                number: "02",
                description:
                  "From single pens to bulk school-lists and office orders, our prices are set to work for real Bulawayo budgets. Ask about our school and business rates.",
              },
              {
                title: "Local Service",
                number: "03",
                description:
                  "We're a Bulawayo shop, staffed by people who know the products. Pop into Shop R4 at Main Street Mall or call us — we're always happy to help.",
              },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="text-center"
              >
                <span className="text-[11px] font-semibold tracking-[0.3em] text-primary/50 mb-4 block">
                  {value.number}
                </span>
                <h3 className="font-serif text-2xl text-foreground mb-5">
                  {value.title}
                </h3>
                <div className="w-8 h-px bg-primary/30 mx-auto mb-5" />
                <p className="text-muted-foreground leading-[1.8]">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Three-image strip */}
      <section className="py-4 md:py-6">
        <div className="grid grid-cols-3 gap-2 md:gap-4 h-[35vh] md:h-[50vh]">
          {[
            {
              src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
              alt: "Colour pencils and art supplies",
            },
            {
              src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80",
              alt: "Tidy office desk with stationery",
            },
            {
              src: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
              alt: "An open notebook",
            },
          ].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="overflow-hidden group"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-40 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/60" />
        </div>

        <div className="relative container-narrow text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/50 mb-5">
              Visit or Call
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Come Say Hello
            </h2>
            <p className="text-white/60 mb-10 max-w-md mx-auto leading-relaxed">
              Shop R4, Main Street Mall, between 14th and 15th Avenue on J. Nkomo
              Street, Bulawayo. Or call us on +263 77 409 8174.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-none px-12 py-6 text-sm tracking-[0.15em] uppercase bg-white text-charcoal hover:bg-white/90"
            >
              <a href="mailto:stationerycitybyo@gmail.com">
                Get in Touch
                <ArrowRight className="ml-3 w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
