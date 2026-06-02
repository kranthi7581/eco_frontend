import { useState } from "react";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { CATEGORY_API } from "../../repo/Apis";
import { Link } from "react-router-dom";

const ProductCard = ({ product, onQuickView }) => {
  const { wishlist, addToWishlist, removeFromWishlist, addToCart, token } = useUser();
  const [addingToCartState, setAddingToCartState] = useState(false);
  const [wishlistUpdating, setWishlistUpdating] = useState(false);

  // Check if product is in wishlist
  const isWishlisted = wishlist.some(
    (item) => Number(item.productId) === Number(product.id)
  );

  // Mock static values for rating and discount if they don't exist
  // We'll generate a steady rating from product.id to keep it consistent
  const getRatingAndReviews = (id) => {
    const rate = 4 + ((id * 3) % 10) / 10; // rating between 4.0 and 4.9
    const count = 12 + ((id * 17) % 150); // review count
    return { rate: rate.toFixed(1), count };
  };

  const { rate, count } = getRatingAndReviews(product.id);
  const discountPercent = 10 + ((product.id * 7) % 25); // discount between 10% and 35%
  const originalPrice = (product.price * (1 + discountPercent / 100)).toFixed(0);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      alert("Please log in to save items to your wishlist.");
      return;
    }
    setWishlistUpdating(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistUpdating(false);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      alert("Please log in to add items to your cart.");
      return;
    }
    setAddingToCartState(true);
    const res = await addToCart(product.id);
    if (res && !res.success) {
      alert(res.message);
    }
    setAddingToCartState(false);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const imageUrl = product.image
    ? `${CATEGORY_API}${product.image}`
    : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Product Image Gallery Wrapper */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Tag (e.g. Sale / Hot / New) */}
        {discountPercent > 15 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold uppercase px-2 py-1 rounded-md tracking-wider shadow-sm z-10">
            Sale -{discountPercent}%
          </span>
        )}

        {/* Floating actions on hover */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
          <button
            onClick={handleQuickViewClick}
            className="p-3 bg-white text-gray-800 hover:text-blue-600 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddToCartClick}
            disabled={addingToCartState || product.quantity <= 0}
            className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all disabled:bg-gray-400 disabled:scale-100"
            title={product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Heart Icon */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistUpdating}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-20 ${
            isWishlisted
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="block flex-1 group-hover:text-blue-600 transition-colors">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(rate) ? "fill-current" : "text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium ml-1">
            {rate} ({count})
          </span>
        </div>

        {/* Pricing & Stock Status */}
        <div className="mt-3 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through">
              ₹{Number(originalPrice).toLocaleString("en-IN")}
            </span>
            <span className="text-lg font-extrabold text-slate-900 leading-none">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            {product.quantity > 0 ? (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                In Stock ({product.quantity})
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Mobile Visible Directly */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between md:hidden gap-2">
          <button
            onClick={handleQuickViewClick}
            className="flex-1 py-1.5 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          <button
            onClick={handleAddToCartClick}
            disabled={addingToCartState || product.quantity <= 0}
            className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:bg-gray-300"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.quantity <= 0 ? "Sold Out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
