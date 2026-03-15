import { useState, useEffect } from "react";
import { productAPI } from "../../api/productAPI";
import ProductCard from "../../components/ui/ProductCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Tag } from "lucide-react";

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await productAPI.getAll();
        const fetched = res.data.data?.products || res.data.products || [];
        setDeals(fetched.filter((p) => p.discount && p.discount > 0));
      } catch {
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (loading) return <LoadingSpinner text="Loading deals..." />;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Tag size={28} className="text-primary" /> Deals & Offers
        </h1>
        <p className="text-text-muted mt-1">
          Grab these discounted items before they&apos;re gone!
        </p>
      </div>

      {deals.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {deals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏷️</p>
          <h3 className="text-lg font-bold mb-1">No deals right now</h3>
          <p className="text-text-muted text-sm">
            Check back later for amazing offers!
          </p>
        </div>
      )}
    </div>
  );
};

export default DealsPage;
