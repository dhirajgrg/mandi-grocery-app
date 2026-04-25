import { useState } from "react";
import {
  Plus,
  Minus,
  Package,
  Leaf,
  Sparkles,
  MailCheck,
  Pencil,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import OptimizedImage from "./OptimizedImage";
import ProductEditModal from "./ProductEditModal";

const ProductCard = ({ product, onProductUpdated }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { addToCart, cartItems, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const inCart = cartItems.find(
    (item) =>
      item.productId?._id === product._id || item.productId === product._id,
  );
  const qty = inCart?.quantity || 0;

  const handleAdd = () => {
    addToCart(product._id, 1, product);
  };

  const handleIncrement = () => updateCartItem(product._id, qty + 1);
  const handleDecrement = () => {
    if (qty <= 1) {
      removeFromCart(product._id);
    } else {
      updateCartItem(product._id, qty - 1);
    }
  };

  const hasDiscount = product.discount > 0;
  const displayPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <OptimizedImage
            src={product.images[0]}
            alt={product.name}
            width={400}
            className="h-full w-full group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-200" />
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              -{product.discount}%
            </span>
          )}
          {product.isOrganic && (
            <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <Leaf size={8} /> Organic
            </span>
          )}
          {product.isFresh && (
            <span className="bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <Sparkles size={8} /> Fresh
            </span>
          )}
        </div>

        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Unavailable
            </span>
          </div>
        )}

        {/* Admin edit button */}
        {isAdmin && (
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 rounded-full shadow hover:bg-primary hover:text-white text-gray-500 transition-all"
            title="Edit product"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 border-t border-gray-100 shadow-[0_-2px_6px_rgba(0,0,0,0.03)]">
        <h3 className="font-semibold text-[11px] line-clamp-1 mb-0.5">
          {product.name}
        </h3>
        <p className="text-[9px] text-gray-400 mb-1">{product.category}</p>

        {/* Stock quantity - admin only */}
        {isAdmin && (
          <p
            className={`text-[9px] font-medium mb-1 ${product.stockQuantity <= (product.lowStockThreshold || 10) ? "text-red-500" : "text-green-600"}`}
          >
            Stock: {product.stockQuantity}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold">
                Rs.{Math.round(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through">
                  Rs.{product.price}
                </span>
              )}
            </div>
            <p className="text-[8px] text-gray-400">per {product.unit}</p>
          </div>

          {product.isAvailable && !isAdmin && (
            <>
              {qty > 0 ? (
                <div className="flex items-center gap-0.5 bg-primary rounded-full">
                  <button
                    onClick={handleDecrement}
                    className="p-1 text-white hover:bg-primary-dark rounded-full transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-white w-4 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-1 text-white hover:bg-primary-dark rounded-full transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="p-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-600 rounded-full transition-all"
                >
                  <Plus size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showEditModal && (
        <ProductEditModal
          product={product}
          onClose={() => setShowEditModal(false)}
          onSaved={onProductUpdated}
        />
      )}
    </div>
  );
};

export default ProductCard;
