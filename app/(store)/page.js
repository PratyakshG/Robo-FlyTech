"use client";
import { useEffect, useState } from "react";
import {
  getProductsWithOffers,
  getActiveOffers,
  getCategories,
  getHeroSlides,
} from "@/lib/api";
import ProductCard from "@/components/store/ProductCard";
import Navbar from "@/components/store/Navbar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import Footer from "@/components/store/Footer";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const PERKS = [
  { icon: Truck, title: "Fast Shipping", sub: "Quick delivery on all orders" },
  { icon: ShieldCheck, title: "Secure Payments", sub: "UPI & COD" },
  { icon: Headphones, title: "24/7 Support", sub: "We're always here" },
  { icon: RotateCcw, title: "COD Available", sub: "Pay on delivery" },
];

const WHY_US = [
  {
    num: "01",
    title: "Curated Selection",
    body: "Every product is hand-picked for quality, performance, and value — no filler.",
  },
  {
    num: "02",
    title: "Genuine Products",
    body: "We stock only authentic items from verified brands and authorized distributors.",
  },
  {
    num: "03",
    title: "Fast Dispatch",
    body: "Orders placed before 4 PM ship the same day from our fulfilment centre.",
  },
  {
    num: "04",
    title: "Expert Advice",
    body: "Our team knows the products inside out — reach us any time for guidance.",
  },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashOffer, setFlashOffer] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroIndex = heroSlides.length ? heroIdx % heroSlides.length : 0;
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const { addToCart } = useCart();

  const handleHeroBuyNow = async (slide) => {
    if (slide.buttonLink === "buy-now" && slide.product) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${slide.product}`,
        );
        const productData = await response.json();
        const buyNowItem = {
          ...productData,
          qty: 1,
          _id: productData._id,
        };
        sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem));
        router.push("/checkout?buyNow=true");
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    }
  };

  useEffect(() => {
    getProductsWithOffers({ sort: "newest", limit: 8 }).then((r) => {
      setProducts(r.data || []);
      setLoading(false);
    });
    getHeroSlides()
      .then((r) => {
        if (r.data?.length) setHeroSlides(r.data);
      })
      .catch(() => {});
    const heroTimer = setInterval(() => setHeroIdx((i) => i + 1), 4000);
    getCategories()
      .then((r) => setCategories(r.data || []))
      .catch(() => {});
    getActiveOffers()
      .then((r) => {
        const offers = r.data || [];
        setFlashOffer(offers.sort((a, b) => b.value - a.value)[0] || null);
      })
      .catch(() => {});
    return () => clearInterval(heroTimer);
  }, []);

  // best discounted product for spotlight
  const spotlightProduct = products.find((p) => p.offerPrice) || products[0];

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* ── HERO ── */}
        <section className="border-b border-gray-200">
          {/* MOBILE HERO */}
          <div className="relative md:hidden h-[70vh] min-h-[400px] overflow-hidden">
            {heroSlides.map((slide, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ opacity: heroIndex === i ? 1 : 0 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={slide.image}
                  alt={slide.label}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            <div className="relative z-10 flex flex-col justify-between h-full px-5 py-8">
              <div className="flex items-center justify-between">
                {heroSlides[heroIndex]?.label && (
                  <span className="bg-[#dc2626] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                    {heroSlides[heroIndex].label}
                  </span>
                )}
                {heroSlides[heroIndex]?.tag && (
                  <span className="bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                    {heroSlides[heroIndex].tag}
                  </span>
                )}
              </div>

              <div className="mb-52">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.6 }}
                      className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-4 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-[#dc2626] inline-block" />
                      {heroSlides[heroIndex]?.badge || "ROBO FLYTECH"}
                    </motion.p>
                    <motion.h1
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.7 }}
                      className="font-black text-[3.2rem] leading-[0.9] tracking-[-0.04em] text-white mb-5"
                    >
                      {heroSlides[heroIndex]?.heading ? (
                        heroSlides[heroIndex].heading
                          .split("|")
                          .map((line, i) => (
                            <span key={i}>
                              {line}
                              {i <
                                heroSlides[heroIndex].heading.split("|")
                                  .length -
                                  1 && <br />}
                            </span>
                          ))
                      ) : (
                        <>
                          Built for
                          <br />
                          the{" "}
                          <span className="text-[#dc2626] italic">signal.</span>
                        </>
                      )}
                    </motion.h1>
                    {heroSlides[heroIndex]?.subtext && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.7 }}
                        className="text-white/70 text-sm mb-7 leading-relaxed max-w-xs"
                      >
                        {heroSlides[heroIndex].subtext}
                      </motion.p>
                    )}
                    <div className="flex gap-3">
                      {heroSlides[heroIndex]?.buttonLink === "buy-now" ? (
                        <button
                          onClick={() =>
                            handleHeroBuyNow(heroSlides[heroIndex])
                          }
                          className="flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-3 text-sm font-bold hover:bg-[#dc2626] hover:text-white transition-colors"
                        >
                          {heroSlides[heroIndex]?.buttonText || "Buy Now"}{" "}
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <Link
                          href={
                            heroSlides[heroIndex]?.buttonLink || "/products"
                          }
                          className="flex items-center gap-2 bg-white text-[#0a0a0a] px-5 py-3 text-sm font-bold hover:bg-[#dc2626] hover:text-white transition-colors"
                        >
                          {heroSlides[heroIndex]?.buttonText || "Shop"}{" "}
                          <ArrowRight size={14} />
                        </Link>
                      )}
                      <Link
                        href="/products?deals=true"
                        className="flex items-center gap-2 border border-white/50 text-white px-5 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                      >
                        Deals <Zap size={13} />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  {heroSlides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      className={`transition-all duration-300 rounded-full ${heroIndex === i ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30"}`}
                    />
                  ))}
                </div>
                <div className="h-[2px] bg-white/20">
                  <motion.div
                    key={heroIndex}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="h-full bg-[#dc2626]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP HERO */}
          <div className="hidden md:grid md:grid-cols-2 max-w-[1400px] mx-auto min-h-[560px]">
            <div className="flex flex-col justify-center py-16 px-6 border-r border-gray-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col"
                >
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-6 flex items-center gap-3"
                  >
                    <span className="w-2 h-2 bg-[#dc2626] inline-block" />
                    {heroSlides[heroIndex]?.badge || "ROBO FLYTECH"}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="font-black text-[4rem] lg:text-[5.5rem] leading-[0.88] tracking-[-0.04em] text-[#0a0a0a] mb-8"
                  >
                    {heroSlides[heroIndex]?.heading ? (
                      heroSlides[heroIndex].heading
                        .split("|")
                        .map((line, i) => (
                          <span key={i}>
                            {line}
                            {i <
                              heroSlides[heroIndex].heading.split("|").length -
                                1 && <br />}
                          </span>
                        ))
                    ) : (
                      <>Loading...</>
                    )}
                  </motion.h1>
                  {heroSlides[heroIndex]?.subtext && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.42, duration: 0.7 }}
                      className="text-gray-500 text-base mb-10 max-w-sm leading-relaxed"
                    >
                      {heroSlides[heroIndex].subtext}
                    </motion.p>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex gap-3 flex-wrap"
                  >
                    {heroSlides[heroIndex]?.buttonLink === "buy-now" ? (
                      <button
                        onClick={() => handleHeroBuyNow(heroSlides[heroIndex])}
                        className="flex items-center gap-2 bg-[#0a0a0a] text-white px-7 py-3.5 text-sm font-semibold hover:bg-[#dc2626] transition-colors"
                      >
                        {heroSlides[heroIndex]?.buttonText || "Buy Now"}{" "}
                        <ArrowRight size={15} />
                      </button>
                    ) : (
                      <Link
                        href={heroSlides[heroIndex]?.buttonLink || "/products"}
                        className="flex items-center gap-2 bg-[#0a0a0a] text-white px-7 py-3.5 text-sm font-semibold hover:bg-[#dc2626] transition-colors"
                      >
                        {heroSlides[heroIndex]?.buttonText || "Shop everything"}{" "}
                        <ArrowRight size={15} />
                      </Link>
                    )}
                    <Link
                      href="/products?deals=true"
                      className="flex items-center gap-2 border-[1.5px] border-[#0a0a0a] text-[#0a0a0a] px-7 py-3.5 text-sm font-semibold hover:bg-[#0a0a0a] hover:text-white transition-colors"
                    >
                      Today's deals <Zap size={14} />
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="relative overflow-hidden bg-gray-100">
              {heroSlides.map((slide, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{ opacity: heroIndex === i ? 1 : 0 }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={slide.image}
                    alt={slide.label}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
              <div className="absolute top-4 left-4 z-10 bg-[#dc2626] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                {heroSlides[heroIndex]?.label}
              </div>
              <div className="absolute top-4 right-4 z-10 bg-[#0a0a0a] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5">
                {heroSlides[heroIndex]?.tag}
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`transition-all duration-300 rounded-full ${heroIndex === i ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                  />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-10 h-[2px] bg-white/20">
                <motion.div
                  key={heroIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className="h-full bg-[#dc2626]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── PERKS BAR ── */}
        <section className="border-b border-gray-200 bg-[#0a0a0a]">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-800">
            {PERKS.map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center gap-3 px-5 md:px-8 py-4 md:py-5"
              >
                <Icon
                  size={18}
                  className="text-[#dc2626] shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORY TICKER ── */}
        {categories.length > 0 && (
          <section className="border-b border-gray-200 py-5 bg-white">
            <div className="ticker-wrap">
              <div className="ticker-track">
                {[0, 1].map((set) => (
                  <span
                    key={set}
                    className="ticker-set"
                  >
                    {Array(Math.ceil(20 / categories.length))
                      .fill(categories)
                      .flat()
                      .map((cat, i) => (
                        <Link
                          key={i}
                          href={`/products?category=${cat.name}`}
                          className="inline-flex items-center gap-5 mx-10 shrink-0 group"
                        >
                          <span className="text-base font-black tracking-widest text-[#0a0a0a] uppercase group-hover:text-[#dc2626] transition-colors">
                            {cat.name}
                          </span>
                          <span className="text-[#dc2626] font-black text-xl leading-none">
                            /
                          </span>
                        </Link>
                      ))}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SHOP BY CATEGORY ── */}
        {categories.length > 0 && (
          <section className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-10 pb-12">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="section-label mb-2">[ 002 / CATEGORIES ]</p>
                  <h2 className="font-black text-[1.8rem] md:text-[2.8rem] tracking-[-0.03em] leading-none text-[#0a0a0a]">
                    Shop By Category.
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#dc2626] transition-colors"
                >
                  All products <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 border-l border-t border-gray-200">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      delay: i * 0.07,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="border-r border-b border-gray-200"
                  >
                    <Link
                      href={`/products?category=${cat.name}`}
                      className="group relative flex flex-col justify-end overflow-hidden min-h-[140px] md:min-h-[160px] aspect-square"
                    >
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="relative z-10 p-5">
                        <p className="text-[10px] font-bold text-[#dc2626]">
                          {String(i + 1).padStart(2, "0")}
                        </p>
                        <h3 className="font-black text-lg md:text-xl tracking-[-0.02em] text-white leading-none">
                          {cat.name}
                        </h3>
                        <div className="flex items-center gap-1 leading-none text-xs font-semibold text-white/60 group-hover:text-white transition-colors mt-2">
                          Shop{" "}
                          <ArrowRight
                            size={11}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FEATURED SPOTLIGHT ── */}
        {spotlightProduct && !loading && (
          <section className="border-b border-gray-200">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
              <p className="section-label mb-8">[ 003 / FEATURED DROP ]</p>
              <div className="grid md:grid-cols-2 border border-gray-200">
                {/* Image */}
                <div className="relative overflow-hidden bg-gray-50 min-h-[280px] md:min-h-[380px]">
                  <img
                    src={
                      spotlightProduct.image || "https://placehold.co/600x400"
                    }
                    alt={spotlightProduct.name}
                    className="w-full h-full object-contain absolute inset-0 hover:scale-105 transition-transform duration-700"
                  />
                  {spotlightProduct.offerPrice && (
                    <span className="absolute top-4 left-4 bg-[#dc2626] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5">
                      {Math.round(
                        (1 -
                          spotlightProduct.offerPrice /
                            spotlightProduct.price) *
                          100,
                      )}
                      % OFF
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-col justify-center p-8 md:p-12 border-t md:border-t-0 md:border-l border-gray-200">
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#dc2626] mb-3">
                    {spotlightProduct.brand} · {spotlightProduct.category}
                  </p>
                  <h2 className="font-black text-[1.8rem] md:text-[2.5rem] tracking-[-0.03em] leading-[1.05] text-[#0a0a0a] mb-4">
                    {spotlightProduct.name}
                  </h2>
                  {spotlightProduct.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-3">
                      {spotlightProduct.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="font-black text-[2rem] text-[#0a0a0a]">
                      ₹{spotlightProduct.price?.toLocaleString()}
                    </span>
                    {spotlightProduct.originalPrice && (
                      <span className="text-base text-gray-400 line-through">
                        ₹{spotlightProduct.originalPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products/${spotlightProduct._id}`}
                    className="flex items-center gap-2 bg-[#0a0a0a] text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#dc2626] transition-colors w-fit"
                  >
                    View Product <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── NEW & TRENDING ── */}
        <section className="max-w-[1400px] mx-auto px-4 md:px-6 pb-16 pt-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">[ 004 / CATALOGUE ]</p>
              <h2 className="font-black text-[1.8rem] md:text-[2.8rem] tracking-[-0.03em] leading-none text-[#0a0a0a]">
                New &amp; trending.
              </h2>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#dc2626] transition-colors"
            >
              See full catalogue <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-l border-t border-gray-200">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="border-r border-b border-gray-200"
                  >
                    <div className="skeleton h-56 w-full" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-3 w-16" />
                      <div className="skeleton h-4 w-full" />
                      <div className="skeleton h-3 w-24" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 *:border *:border-gray-200 gap-5 *:rounded-xl *:overflow-clip">
              {products.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="border-r border-b border-gray-200"
                >
                  <ProductCard
                    product={p}
                    index={i}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="border-t border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-label mb-2">[ 005 / WHY US ]</p>
                <h2 className="font-black text-[1.8rem] md:text-[2.8rem] tracking-[-0.03em] leading-none text-[#0a0a0a]">
                  Why Robo Flytech.
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 border-l border-t border-gray-200">
              {WHY_US.map(({ num, title, body }, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border-r border-b border-gray-200 p-6 md:p-8 group hover:bg-gray-50 transition-colors"
                >
                  <p className="text-[#dc2626] font-black text-[2rem] leading-none tracking-[-0.04em] mb-4">
                    {num}
                  </p>
                  <h3 className="font-black text-base tracking-[-0.02em] text-[#0a0a0a] mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FLASH SALE BANNER ── */}
        {flashOffer && (
          <section className="bg-[#dc2626] text-white">
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-red-200 mb-4">
                  [ {flashOffer.badge || "FLASH"} /{" "}
                  {Math.ceil(
                    (new Date(flashOffer.endDate) - new Date()) / 3600000,
                  )}
                  H ONLY ]
                </p>
                <h2 className="font-black text-[2.5rem] md:text-[4rem] leading-[0.9] tracking-[-0.03em] mb-3">
                  Up to -
                  {flashOffer.type === "percentage"
                    ? `${flashOffer.value}%`
                    : `₹${flashOffer.value}`}
                  <br />
                  this weekend.
                </h2>
                <p className="text-red-200 text-sm mb-6">
                  {flashOffer.description}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-[#dc2626] px-8 py-3.5 text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  Shop the sale <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {!loading &&
                  products
                    .filter((p) => p.offerPrice)
                    .slice(0, 2)
                    .concat(products.filter((p) => !p.offerPrice).slice(0, 2))
                    .slice(0, 2)
                    .map((p) => (
                      <Link
                        key={p._id}
                        href={`/products/${p._id}`}
                        className="bg-white group overflow-hidden"
                      >
                        <img
                          src={p.image || "https://placehold.co/300x200"}
                          alt={p.name}
                          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-3">
                          <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                            {p.brand}
                          </p>
                          <p className="text-sm font-bold text-[#0a0a0a] truncate">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-black text-[#0a0a0a]">
                              ₹{(p.offerPrice || p.price)?.toLocaleString()}
                            </p>
                            {p.offerPrice && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{p.price?.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FULL WIDTH CTA ── */}
        <section className="bg-[#0a0a0a]">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gray-500 mb-3">
                [ 006 / GET STARTED ]
              </p>
              <h2 className="font-black text-[2rem] md:text-[3.5rem] leading-[0.92] tracking-[-0.04em] text-white">
                Your next
                <br />
                favourite gear
                <br />
                is one click{" "}
                <span className="text-[#dc2626] italic">away.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="flex items-center gap-2 bg-white text-[#0a0a0a] px-8 py-4 text-sm font-bold hover:bg-[#dc2626] hover:text-white transition-colors"
              >
                Browse all products <ArrowRight size={15} />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 text-sm font-semibold hover:border-white transition-colors"
              >
                About us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
