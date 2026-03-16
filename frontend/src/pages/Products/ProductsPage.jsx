import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI } from "../../api/productAPI";
import ProductCard from "../../components/ui/ProductCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Search, SlidersHorizontal, X } from "lucide-react";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterFresh, setFilterFresh] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll();
        const fetchedProducts =
          res.data.data?.products || res.data.products || [];

        setAllProducts(fetchedProducts);
        setProducts(fetchedProducts);
        setCategories(
          [
            ...new Set(fetchedProducts.map((product) => product.category)),
          ].filter(Boolean),
        );
      } catch {
        setAllProducts([]);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const searchTerms = searchTerm
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const filteredProducts = allProducts.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const price = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;
      if (minPrice !== "" && price < Number(minPrice)) return false;
      if (maxPrice !== "" && price > Number(maxPrice)) return false;
      if (filterOrganic && !product.isOrganic) return false;
      if (filterFresh && !product.isFresh) return false;

      if (searchTerms.length === 0) {
        return matchesCategory;
      }

      const searchableText =
        `${product.name || ""} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      const matchesSearch = searchTerms.some((term) =>
        searchableText.includes(term),
      );
      return matchesCategory && matchesSearch;
    });

    setProducts(filteredProducts);
  }, [
    allProducts,
    searchTerm,
    selectedCategories,
    minPrice,
    maxPrice,
    filterOrganic,
    filterFresh,
  ]);

  const handleCategorySelect = (cat) => {
    setSelectedCategories((prev) => {
      const newCats = prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat];
      if (newCats.length === 1) {
        setSearchParams({ category: newCats[0] });
      } else if (newCats.length === 0) {
        setSearchParams({});
      } else {
        setSearchParams({});
      }
      return newCats;
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setFilterOrganic(false);
    setFilterFresh(false);
    setSearchParams({});
  };

  const activeFilterCount =
    selectedCategories.length +
    (minPrice !== "" ? 1 : 0) +
    (maxPrice !== "" ? 1 : 0) +
    (filterOrganic ? 1 : 0) +
    (filterFresh ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-text-muted">
          Browse our fresh collection of groceries
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder="Search products... (e.g. tomato, potato)"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-text-muted cursor-pointer hover:text-text hover:border-primary/30 hover:scale-105 active:scale-95 transition-all sm:w-auto"
        >
          <SlidersHorizontal size={18} />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-xl bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-error hover:text-error/80 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                    selectedCategories.includes(cat)
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2">
              Price Range
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                className="w-24 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-primary"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                className="w-24 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Type toggles */}
          <div className="flex gap-2">
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
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {(selectedCategories.length > 0 || searchTerm) && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm text-gray-500">Showing results for:</span>
          {searchTerm && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              {searchTerm}
            </span>
          )}
          {selectedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full cursor-pointer hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              {cat}
              <X size={12} />
            </button>
          ))}
          <button
            onClick={clearFilters}
            className="p-1 rounded-full cursor-pointer hover:bg-surface-light hover:scale-110 active:scale-95 transition-all"
          >
            <X size={14} className="text-text-muted" />
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-text-muted text-sm">
            Try adjusting your search or filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-6 py-2 text-sm font-medium text-primary-light hover:text-primary border border-primary/30 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
