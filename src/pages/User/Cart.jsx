import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { CATEGORY_API } from "../../repo/Apis";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft,
  Ticket,
  Receipt
} from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, cartLoading } = useUser();
  const navigate = useNavigate();

  // Coupon Code State
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // Standard mock coupons matching admin capabilities
    if (code === "ECOM10" || code === "WELCOME10") {
      setDiscountPercent(10);
      setCouponSuccess("Promo coupon applied! 10% discount off subtotal.");
    } else if (code === "SUPER20" || code === "SAVE20") {
      setDiscountPercent(20);
      setCouponSuccess("Promo coupon applied! 20% discount off subtotal.");
    } else {
      setCouponError("Invalid coupon code. Try 'WELCOME10' or 'SUPER20'.");
      setDiscountPercent(0);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => {
      const prod = item.Product || item.product || item.products || {};
      const price = prod.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingAmount = subtotal > 1000 ? 0 : 99; // Free shipping above 1000 INR
  const totalAmount = subtotal - discountAmount + shippingAmount;

  const handleCheckoutProceed = () => {
    // Navigate to checkout with pricing states as query parameters or state
    navigate("/checkout", {
      state: {
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount,
        appliedCoupon: couponCode.trim().toUpperCase()
      }
    });
  };

  if (cartLoading && cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
        <p className="text-gray-500 mt-4 text-sm font-medium">Fetching your shopping cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation title */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900">Your Cart</h1>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Cart List (2 Cols on large screen) */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const prod = item.Product || item.product || item.products || {};
                const imageUrl = prod.image 
                  ? `${CATEGORY_API}${prod.image}` 
                  : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200";
                
                const unitPrice = prod.price || 0;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div 
                    key={item.id || item.productId}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                      <img src={imageUrl} alt={prod.name} className="w-full h-full object-contain" />
                    </div>

                    {/* Name & Details */}
                    <div className="flex-1 text-center sm:text-left">
                      <Link to={`/product/${item.productId}`} className="text-sm font-bold text-gray-800 hover:text-blue-600 line-clamp-1">
                        {prod.name || "Product Item"}
                      </Link>
                      <p className="text-xs text-gray-400 font-semibold mt-1">Unit Price: ₹{unitPrice.toLocaleString("en-IN")}</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shrink-0">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-50 text-gray-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-extrabold text-gray-800 min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-50 text-gray-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Sum pricing */}
                    <div className="text-center sm:text-right shrink-0 min-w-28">
                      <p className="text-sm font-extrabold text-slate-900">₹{itemTotal.toLocaleString("en-IN")}</p>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors shrink-0"
                      title="Remove product"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                  </div>
                );
              })}
            </div>

            {/* Right side: Summary panel (1 Col on large screen) */}
            <div className="space-y-6">
              
              {/* Order Summary box */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h3>

                <div className="space-y-3.5 text-sm font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Discount</span>
                      <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-gray-900">
                      {shippingAmount === 0 ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">Free</span>
                      ) : (
                        `₹${shippingAmount}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-3.5 flex justify-between text-base font-extrabold text-slate-900">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckoutProceed}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all mt-6 text-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Promo Coupon Box */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  Apply Coupon Code
                </h4>
                
                {couponError && (
                  <div className="mb-3 text-[10px] font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                    {couponError}
                  </div>
                )}
                {couponSuccess && (
                  <div className="mb-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    {couponSuccess}
                  </div>
                )}

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 uppercase font-semibold text-gray-700"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>
                <span className="text-[10px] text-gray-400 font-semibold block mt-2">Try entering 'WELCOME10' for 10% off.</span>
              </div>

            </div>

          </div>
        ) : (
          /* Empty Cart State */
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Your shopping cart is empty</h3>
            <p className="text-sm text-gray-500 mt-2">
              Looks like you haven't added any products to your cart yet. Explore our top catalogs to find your choice.
            </p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-full mt-6 transition-colors shadow"
            >
              Start Shopping
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
