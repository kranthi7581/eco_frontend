import { useState } from "react";
import { X, ShoppingCart, Heart, ShieldCheck, Truck } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { CATEGORY_API } from "../../repo/Apis";
import { Link } from "react-router-dom";

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart, wishlist, addToWishlist, removeFromWishlist, token, triggerAuthModal } = useUser();
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistUpdating, setWishlistUpdating] = useState(false);

  if (!product) return null;

  const isWishlisted = wishlist.some(
    (item) => Number(item.productId) === Number(product.id)
  );

  const discountPercent = 10 + ((product.id * 7) % 25);
  const originalPrice = (product.price * (1 + discountPercent / 100)).toFixed(0);

  const handleWishlistToggle = async () => {
    const toggle = async () => {
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

    if (!token) {
      triggerAuthModal(toggle);
    } else {
      await toggle();
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const res = await addToCart(product.id);
    if (res && !res.success) {
      alert(res.message);
    } else if (res && res.success) {
      onClose();
    }
    setAddingToCart(false);
  };

  const imageUrl = product.image
    ? `${CATEGORY_API}${product.image}`
    : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col md:flex-row animate-in zoom-in-95 duration-250">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-all hover:scale-105 active:scale-95 z-30"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 border-r border-gray-100">
          <div className="relative w-full aspect-square max-h-[350px] overflow-hidden rounded-2xl bg-white shadow-sm border">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-2"
            />
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto max-h-[50vh] md:max-h-[90vh] flex flex-col justify-between">
          <div>
            {/* Title & Badge */}
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Quick View
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 leading-snug mb-3">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{Number(originalPrice).toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                -{discountPercent}% OFF
              </span>
            </div>

            {/* Description */}
            <div className="mb-5 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed max-h-[120px] overflow-y-auto">
                {product.description || "No description provided for this catalog item. This premium product offers top tier reliability, modern aesthetic designs, and is built to exceed expectations."}
              </p>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-sm">
                <span className="font-semibold text-gray-700">Stock Availability: </span>
                {product.quantity > 0 ? (
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                    In Stock ({product.quantity} items left)
                  </span>
                ) : (
                  <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full text-xs">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Delivery/Security mock icons */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Express Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>1 Year Warranty</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.quantity <= 0}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-blue-600/10 text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {addingToCart ? "Adding..." : product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistUpdating}
              className={`w-12 h-12 flex items-center justify-center border rounded-xl hover:bg-gray-50 transition-all ${
                isWishlisted 
                  ? "border-red-200 text-red-500 bg-red-50" 
                  : "border-gray-300 text-gray-600 hover:text-red-500"
              }`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="h-12 px-4 border border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl font-bold flex items-center justify-center text-sm transition-colors text-gray-700"
            >
              Details
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default QuickViewModal;
