import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { CATEGORY_API } from "../../repo/Apis";
import api from "../../services/api";
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
  const { cart, removeFromCart, updateCartQuantity, cartLoading, token, triggerAuthModal } = useUser();
  const navigate = useNavigate();

  // Coupon Code State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponsList, setCouponsList] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  // Fetch available coupons from DB
  useEffect(() => {
    const fetchCoupons = async () => {
      setCouponsLoading(true);
      try {
        const res = await api.get(`${CATEGORY_API}/coupon`);
        if (res.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          setCouponsList(list.filter(c => c.isActive));
        }
      } catch (err) {
        console.error("Failed to fetch coupons from DB:", err);
      } finally {
        setCouponsLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => {
      const prod = item.Product || item.product || item.products || {};
      const price = prod.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Dynamically calculate discount based on DB coupon attributes
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderAmount) return 0;

    let discount = 0;
    if (appliedCoupon.discountType === "percentage") {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount) {
        discount = Math.min(discount, appliedCoupon.maxDiscount);
      }
    } else if (appliedCoupon.discountType === "fixed") {
      discount = appliedCoupon.discountValue;
    }
    return Math.round(discount);
  };

  // If cart subtotal drops below coupon minimum order requirements, remove coupon
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minOrderAmount) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppliedCoupon(null);
      setCouponSuccess("");
      setCouponError(`Coupon '${appliedCoupon.code}' removed: minimum purchase of ₹${appliedCoupon.minOrderAmount} required.`);
    }
  }, [subtotal, appliedCoupon]);

  const handleApplyCoupon = (e, codeToApply = null) => {
    if (e) e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    const foundCoupon = couponsList.find(c => c.code.toUpperCase() === code);
    if (!foundCoupon) {
      setCouponError(`Invalid coupon code. Try one of the available promotions.`);
      setAppliedCoupon(null);
      return;
    }

    // Expiry check
    const now = new Date();
    const expiry = new Date(foundCoupon.expiryDate);
    if (expiry < now) {
      setCouponError(`Coupon '${foundCoupon.code}' has expired.`);
      setAppliedCoupon(null);
      return;
    }

    // Minimum subtotal validation
    if (subtotal < foundCoupon.minOrderAmount) {
      setCouponError(`Minimum purchase of ₹${foundCoupon.minOrderAmount} is required for coupon '${foundCoupon.code}'.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(foundCoupon);
    setCouponCode(foundCoupon.code); // Sync input box
    
    const valueStr = foundCoupon.discountType === "percentage" 
      ? `${foundCoupon.discountValue}%` 
      : `₹${foundCoupon.discountValue}`;
    setCouponSuccess(`Coupon '${foundCoupon.code}' successfully applied! Discount of ${valueStr} applied.`);
  };

  const discountAmount = calculateDiscount();
  const shippingAmount = subtotal > 1000 ? 0 : 99; // Free shipping above 1000 INR
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  const handleCheckoutProceed = () => {
    const proceed = () => {
      navigate("/checkout", {
        state: {
          subtotal,
          discountAmount,
          shippingAmount,
          totalAmount,
          appliedCoupon: appliedCoupon ? appliedCoupon.code : ""
        }
      });
    };

    if (!token) {
      triggerAuthModal(proceed, "Login required to place order");
    } else {
      proceed();
    }
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
                <span className="text-[10px] text-gray-400 font-semibold block mt-2">Select from the active promotions below or type a code.</span>
              </div>

              {/* Available Coupons Box */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-2">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  Available Promotions
                </h4>
                
                {couponsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : couponsList.length > 0 ? (
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                    {couponsList.map((coupon) => {
                      const isApplied = appliedCoupon?.id === coupon.id;
                      const isMinimumSatisfied = subtotal >= coupon.minOrderAmount;
                      const discountText = coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% Off`
                        : `₹${coupon.discountValue} Off`;
                      
                      return (
                        <div 
                          key={coupon.id}
                          className={`relative border rounded-2xl p-4 transition-all duration-200 ${
                            isApplied 
                              ? "border-emerald-500 bg-emerald-50/30" 
                              : !isMinimumSatisfied 
                                ? "border-gray-100 bg-gray-50/40 opacity-75"
                                : "border-dashed border-gray-200 hover:border-blue-500 bg-white"
                          }`}
                        >
                          {/* Ticket notch decorations */}
                          <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-gray-50 border-r border-gray-100 rounded-full z-10" />
                          <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-3 h-3 bg-gray-50 border-l border-gray-100 rounded-full z-10" />

                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider ${
                                isApplied 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : "bg-blue-50 text-blue-700"
                              }`}>
                                {coupon.code}
                              </span>
                              <h5 className="text-xs font-bold text-slate-800 mt-2">
                                {discountText} {coupon.maxDiscount ? `(Up to ₹${coupon.maxDiscount})` : ""}
                              </h5>
                              <p className="text-[10px] text-gray-400 font-semibold mt-1">
                                Min. Purchase: ₹{coupon.minOrderAmount.toLocaleString("en-IN")}
                              </p>
                              {coupon.expiryDate && (
                                <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                                  Expires: {new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                                </p>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleApplyCoupon(null, coupon.code)}
                              disabled={isApplied}
                              className={`h-7 px-3 rounded-lg text-[10px] font-extrabold transition-all ${
                                isApplied
                                  ? "bg-emerald-100 text-emerald-800 cursor-default"
                                  : !isMinimumSatisfied
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-slate-900 hover:bg-blue-600 hover:text-white text-white cursor-pointer"
                              }`}
                            >
                              {isApplied ? "Applied" : "Apply"}
                            </button>
                          </div>
                          
                          {!isMinimumSatisfied && (
                            <p className="text-[9px] text-rose-500 font-semibold mt-2.5">
                              Add ₹{(coupon.minOrderAmount - subtotal).toLocaleString("en-IN")} more to unlock
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold text-center py-2">
                    No active promotions available right now.
                  </p>
                )}
              </div>      </div>

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
