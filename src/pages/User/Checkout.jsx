import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  CreditCard, 
  ShoppingBag, 
  Receipt,
  UserCheck
} from "lucide-react";

// Helper to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCartLocal, cart, user, token } = useUser();

  // Price calculations passed from Cart page, fallback if entered directly
  const pricing = location.state || {
    subtotal: 0,
    discountAmount: 0,
    shippingAmount: 99,
    totalAmount: 99,
    appliedCoupon: ""
  };

  // States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'razorpay', 'upi', 'card', 'cod'

  // New Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get(`${CATEGORY_API}/address`, { headers });
      if (res.data && Array.isArray(res.data.addresses)) {
        setAddresses(res.data.addresses);
        if (res.data.addresses.length > 0) {
          setSelectedAddressId(res.data.addresses[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError("");
    setAddressLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const finalLabel = label.trim() || "home";
      const finalCountry = country.trim() || "India";

      const res = await api.post(
        `${CATEGORY_API}/address`,
        {
          label: finalLabel,
          line1: line1.trim(),
          line2: line2.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: finalCountry
        },
        { headers }
      );

      if (res.data && res.data.address) {
        setAddresses((prev) => [...prev, res.data.address]);
        setSelectedAddressId(res.data.address.id);
        setShowAddressForm(false);
        // Clear fields
        setLabel("");
        setLine1("");
        setLine2("");
        setCity("");
        setState("");
        setPincode("");
        setCountry("");
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || "Failed to create address.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedAddressId) {
      alert("Please select or add a delivery address.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Resolve address string
      const addr = addresses.find((a) => a.id == selectedAddressId);
      const addressString = `${addr.label || 'Home'}: ${addr.line1}, ${addr.line2 ? addr.line2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`;

      // 1. Submit order via checkout API
      const checkoutRes = await api.post(
        `${CATEGORY_API}/checkout`,
        { address: addressString },
        { headers }
      );

      if (checkoutRes.status === 200) {
        const dbOrderId = checkoutRes.data.orderId;

        // Cash on Delivery flow
        if (paymentMethod === "cod") {
          clearCartLocal();
          setTimeout(() => {
            setLoading(false);
            navigate("/success", {
              state: {
                orderId: dbOrderId,
                address: addressString,
                totalAmount: pricing.totalAmount,
                paymentMethod: "cod"
              }
            });
          }, 1000);
          return;
        }

        // Razorpay / online payment flow
        // 2. Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert("Failed to load Razorpay SDK. Please check your internet connection.");
          setLoading(false);
          return;
        }

        // 3. Fetch Razorpay key ID from backend
        let keyRes;
        try {
          keyRes = await api.get(`${CATEGORY_API}/payment/key`, { headers });
        } catch (keyErr) {
          console.error("Failed to load Razorpay API key from backend:", keyErr);
          alert("Failed to load payment configuration. Please try again.");
          setLoading(false);
          return;
        }
        const razorpayKey = keyRes.data.key;

        // 4. Create Razorpay order on backend
        let razorpayOrderRes;
        try {
          razorpayOrderRes = await api.post(
            `${CATEGORY_API}/payment/create-order`,
            {
              amount: pricing.totalAmount,
              orderId: dbOrderId
            },
            { headers }
          );
        } catch (orderErr) {
          console.error("Failed to create Razorpay payment order:", orderErr);
          alert(orderErr.response?.data?.error || "Failed to initialize payment gateway.");
          setLoading(false);
          return;
        }

        if (!razorpayOrderRes.data?.success) {
          alert("Payment gateway order creation failed on backend.");
          setLoading(false);
          return;
        }

        const razorpayOrder = razorpayOrderRes.data.order;

        // 5. Setup Razorpay options and open Modal
        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount, // in subunits (paise)
          currency: razorpayOrder.currency,
          name: "Ecommerce Demo",
          description: `Payment for Order #${dbOrderId}`,
          order_id: razorpayOrder.id,
          prefill: {
            name: user?.username || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#2563eb", // tailwind blue-600
          },
          handler: async function (response) {
            setLoading(true);
            try {
              // 6. Verify Razorpay signature on backend
              const verifyRes = await api.post(
                `${CATEGORY_API}/payment/verify-payment`,
                {
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                },
                { headers }
              );

              if (verifyRes.data.success) {
                clearCartLocal();
                navigate("/success", {
                  state: {
                    orderId: dbOrderId,
                    address: addressString,
                    totalAmount: pricing.totalAmount,
                    paymentMethod
                  }
                });
              } else {
                alert("Payment verification failed. Please contact customer support.");
              }
            } catch (verifyErr) {
              console.error("Payment verification request failed:", verifyErr);
              alert("Error verifying payment signature. Order was placed with pending status.");
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              alert("Payment cancelled. You can pay for your order from your Profile orders tab.");
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      }
    } catch (error) {
      console.error("Checkout order error:", error);
      alert(error.response?.data?.message || "An error occurred while placing the order.");
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h2 className="text-xl font-bold text-gray-800">Your Checkout is empty</h2>
        <p className="text-sm text-gray-500 mt-2">Go back to cart and choose items to checkout.</p>
        <Link to="/cart" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow">
          Go to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Address and Payment options (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Address Section */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4 border-b border-gray-50 pb-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Delivery Address
                </h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddressForm ? "Select Address" : "Add Address"}
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-800 mb-2">New Address details</h4>
                  
                  {addressError && (
                    <div className="p-2.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg">
                      {addressError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Label (Optional - defaults to 'home')</label>
                      <input
                        type="text"
                        placeholder="e.g. home, work"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pincode (Required)</label>
                      <input
                        type="text"
                        required
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Street address details (Required)</label>
                    <input
                      type="text"
                      required
                      placeholder="Street address details"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Local landmark or secondary address line (Optional)</label>
                    <input
                      type="text"
                      placeholder="Local landmark or secondary address line"
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">City (Required)</label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">State (Required)</label>
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Country (Optional - defaults to 'India')</label>
                      <input
                        type="text"
                        placeholder="India"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addressLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow disabled:opacity-50"
                  >
                    {addressLoading ? "Saving Address..." : "Save Address"}
                  </button>
                </form>
              ) : (
                /* Select from existing addresses */
                <div className="space-y-3">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
                          selectedAddressId == addr.id
                            ? "border-blue-600 bg-blue-50/20"
                            : "border-gray-150 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId == addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 cursor-pointer accent-blue-600"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] bg-gray-100 px-2 py-0.5 rounded mr-2">
                            {addr.label || "Home"}
                          </span>
                          <p className="font-bold text-gray-800 mt-2">{addr.line1}</p>
                          {addr.line2 && <p className="text-gray-600 mt-0.5">{addr.line2}</p>}
                          <p className="text-gray-500 font-semibold mt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-xs font-semibold">
                      No saved addresses found. Please click 'Add Address' to fill shipping details.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Payment Methods Section */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Select Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Razorpay Option */}
                <div
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "razorpay"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-gray-150 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Razorpay Secure Checkout</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Cards, Netbanking, Wallets</p>
                  </div>
                </div>

                {/* UPI Option */}
                <div
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "upi"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-gray-150 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                    className="accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">UPI (Google Pay/PhonePe)</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Instant pay using UPI App</p>
                  </div>
                </div>

                {/* Card Option */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-gray-150 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Credit / Debit Card</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Visa, Mastercard, RuPay, Amex</p>
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50/20"
                      : "border-gray-150 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-blue-600 cursor-pointer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Pay in cash upon doorstep arrival</p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Right Summary Panel (1 Col) */}
          <div>
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-24 space-y-6">
              
              {/* Order Summary details */}
              <div>
                <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h3>

                <div className="space-y-3.5 text-sm font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-900">₹{pricing.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Discount</span>
                      <span>- ₹{pricing.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-gray-900">
                      {pricing.shippingAmount === 0 ? "Free" : `₹${pricing.shippingAmount}`}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-3.5 flex justify-between text-base font-extrabold text-slate-900">
                    <span>Grand Total</span>
                    <span>₹{pricing.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 bg-blue-50/50 p-3 rounded-2xl text-[10px] text-blue-800 font-semibold leading-normal">
                <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>By completing checkout, you agree to our buyer protection policies.</span>
              </div>

              {/* Complete Payment CTA */}
              <button
                onClick={handleCompletePayment}
                disabled={loading || !selectedAddressId}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Complete Payment</span>
                  </>
                )}
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
