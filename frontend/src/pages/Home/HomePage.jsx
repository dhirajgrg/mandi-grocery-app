import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../../api/productAPI";
import ProductCard from "../../components/ui/ProductCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  Truck,
  ShieldCheck,
  Leaf,
  ArrowRight,
  MailWarning,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/authAPI";
import toast from "react-hot-toast";

const heroSlides = [
  {
    title: "Fresh Groceries,",
    highlight: "Delivered Fast",
    desc: "Shop from a wide range of fresh fruits, vegetables, dairy, and everyday essentials at the best prices.",
    cta: "Shop Now",
    ctaLink: "/products",
    bg: "from-primary/10 via-white to-primary/5",
  },
  {
    title: "Deals of the Day,",
    highlight: "Up to 40% Off",
    desc: "Grab amazing discounts on handpicked fresh produce and pantry staples. Limited time offers!",
    cta: "View Deals",
    ctaLink: "/deals",
    bg: "from-amber-50 via-white to-amber-50",
  },
  {
    title: "Farm Fresh,",
    highlight: "100% Organic",
    desc: "Sourced directly from local farms. Enjoy the freshest organic fruits and vegetables every day.",
    cta: "Explore",
    ctaLink: "/products",
    bg: "from-emerald-50 via-white to-emerald-50",
  },
];

// Build extended slides: [lastClone, ...originals, firstClone]
const extendedSlides = [
  heroSlides[heroSlides.length - 1],
  ...heroSlides,
  heroSlides[0],
];

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  const showVerifyBanner =
    isAuthenticated && user && user.emailVerified === false;

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authAPI.resendVerificationEmail({ email: user.email });
      toast.success("Verification email sent! Check your inbox.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send verification email",
      );
    } finally {
      setResending(false);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterFresh, setFilterFresh] = useState(false);

  // Hero carousel — index into extendedSlides (1 = first real slide)
  const [heroIndex, setHeroIndex] = useState(1);
  const [heroTransition, setHeroTransition] = useState(true);
  const heroIntervalRef = useRef(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await productAPI.getAll();
        const fetched = res.data.data?.products || res.data.products || [];
        setAllProducts(fetched);
        setCategories(
          [...new Set(fetched.map((p) => p.category))].filter(Boolean),
        );
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // After transition ends on a clone, instantly jump to the real slide
  const handleTransitionEnd = useCallback(() => {
    isTransitioning.current = false;
    if (heroIndex === 0) {
      // Jumped to last-clone → go to real last slide
      setHeroTransition(false);
      setHeroIndex(heroSlides.length);
    } else if (heroIndex === extendedSlides.length - 1) {
      // Jumped to first-clone → go to real first slide
      setHeroTransition(false);
      setHeroIndex(1);
    }
  }, [heroIndex]);

  // Re-enable transition after the instant jump
  useEffect(() => {
    if (!heroTransition) {
      const id = requestAnimationFrame(() => setHeroTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [heroTransition]);

  const goNext = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setHeroTransition(true);
    setHeroIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setHeroTransition(true);
    setHeroIndex((prev) => prev - 1);
  }, []);

  // Map extended index to real slide index for dots
  const realIndex =
    heroIndex === 0
      ? heroSlides.length - 1
      : heroIndex === extendedSlides.length - 1
        ? 0
        : heroIndex - 1;

  const goToSlide = (i) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setHeroTransition(true);
    setHeroIndex(i + 1);
  };

  // Auto-rotate
  useEffect(() => {
    heroIntervalRef.current = setInterval(goNext, 5000);
    return () => clearInterval(heroIntervalRef.current);
  }, [goNext]);

  const filteredProducts = allProducts.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    const price = p.discount ? p.price * (1 - p.discount / 100) : p.price;
    if (minPrice !== "" && price < Number(minPrice)) return false;
    if (maxPrice !== "" && price > Number(maxPrice)) return false;
    if (filterOrganic && !p.isOrganic) return false;
    if (filterFresh && !p.isFresh) return false;
    return true;
  });

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (minPrice !== "" ? 1 : 0) +
    (maxPrice !== "" ? 1 : 0) +
    (filterOrganic ? 1 : 0) +
    (filterFresh ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setFilterOrganic(false);
    setFilterFresh(false);
  };

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Get your groceries delivered in hours",
    },
    {
      icon: Leaf,
      title: "Fresh & Organic",
      desc: "Handpicked quality produce daily",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      desc: "100% safe and secure checkout",
    },
    {
      icon: Tag,
      title: "Best Prices",
      desc: "Competitive prices on all items",
    },
  ];

  if (loading) return <LoadingSpinner text="Loading store..." />;

  return (
    <div className="min-h-screen">
      {/* Email Verification Banner */}
      {showVerifyBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-amber-800">
              <MailWarning size={18} className="shrink-0" />
              <p className="text-sm font-medium">
                Your email is not verified. Please verify to unlock all features
                like adding items to cart.
              </p>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors"
            >
              {resending && <Loader2 size={14} className="animate-spin" />}
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        </div>
      )}

      {/* Hero Carousel */}
      <section className="relative overflow-hidden">
        <div
          className={`flex ${heroTransition ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{ transform: `translateX(-${heroIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((slide, i) => (
            <div
              key={i}
              className={`w-full shrink-0 bg-gradient-to-br ${slide.bg}`}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <div className="text-center max-w-2xl mx-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                    <Leaf size={14} /> Fresh from farm to your door
                  </span>
                  <h1 className="text-4xl sm:text-5xl font-bold text-text mb-4 leading-tight">
                    {slide.title}
                    <br />
                    <span className="text-primary">{slide.highlight}</span>
                  </h1>
                  <p className="text-text-muted text-lg mb-8">{slide.desc}</p>
                  <Link
                    to={slide.ctaLink}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 inline-flex items-center gap-2"
                  >
                    {slide.cta} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === realIndex ? "w-6 bg-primary" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      {categories.length > 0 && (
        <section className="bg-surface-light">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
            <div className="flex gap-3 overflow-x-auto pt-1 pb-3 scrollbar-none">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="shrink-0 px-6 py-3 rounded-xl bg-white border border-border text-sm font-semibold hover:border-primary hover:text-primary hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Browse All Products</h2>
            <p className="text-text-muted text-sm mt-1">
              {filteredProducts.length} items available
            </p>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-4">
          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("")}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                  !selectedCategory
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(cat === selectedCategory ? "" : cat)
                  }
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Price range + toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                className="w-20 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-primary"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                className="w-20 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={() => setFilterOrganic(!filterOrganic)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                filterOrganic
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
            >
              🌿 Organic
            </button>

            <button
              onClick={() => setFilterFresh(!filterFresh)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                filterFresh
                  ? "bg-sky-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✨ Fresh
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-error hover:underline ml-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {filteredProducts.slice(0, 10).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {filteredProducts.length > 10 && (
          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark hover:scale-105 active:scale-95 cursor-pointer transition-all"
            >
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
