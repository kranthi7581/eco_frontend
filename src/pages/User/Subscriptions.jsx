import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { Check, Sparkles, Loader2, CreditCard, ShieldCheck, HelpCircle } from "lucide-react";

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

const Subscriptions = () => {
  const navigate = useNavigate();
  const { user, token } = useUser();

  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Fetch active plans (public or authenticated)
      const plansRes = await api.get(`${CATEGORY_API}/plans`, { headers }).catch((err) => {
        console.error("Error fetching plans:", err);
        return null;
      });
      if (plansRes && plansRes.data && Array.isArray(plansRes.data.plans)) {
        setPlans(plansRes.data.plans);
      }

      // Fetch user's active subscription (authenticated only)
      if (token) {
        const subRes = await api.get(`${CATEGORY_API}/subscription/my-plan`, { headers }).catch((err) => {
          console.error("Error fetching current subscription:", err);
          return null;
        });
        if (subRes && subRes.data && subRes.data.success && subRes.data.active) {
          setActiveSub(subRes.data.subscription);
        } else {
          setActiveSub(null);
        }
      }
    } catch (err) {
      console.error("Error loading subscription page data:", err);
      setError("Failed to load plans or current subscription status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleBuyPlan = async (plan) => {
    if (!token || !user) {
      // Prompt user to sign in
      alert("Please sign in to purchase a subscription plan.");
      navigate("/login", { state: { from: "/subscriptions" } });
      return;
    }

    setPaymentLoadingId(plan.id);
    setSuccessMessage("");
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setPaymentLoadingId(null);
        return;
      }

      // 2. Fetch Razorpay key ID from backend
      let keyRes;
      try {
        keyRes = await api.get(`${CATEGORY_API}/payment/key`, { headers });
      } catch (keyErr) {
        console.error("Failed to load Razorpay API key:", keyErr);
        alert("Failed to load payment gateway configuration.");
        setPaymentLoadingId(null);
        return;
      }
      const razorpayKey = keyRes.data.key;

      // 3. Create Razorpay order on backend
      let orderRes;
      try {
        orderRes = await api.post(
          `${CATEGORY_API}/subscription/create-order`,
          { planId: plan.id },
          { headers }
        );
      } catch (orderErr) {
        console.error("Failed to create Razorpay subscription order:", orderErr);
        alert(orderErr.response?.data?.message || "Failed to initialize subscription checkout.");
        setPaymentLoadingId(null);
        return;
      }

      if (!orderRes.data?.success) {
        alert("Order creation failed on backend.");
        setPaymentLoadingId(null);
        return;
      }

      const razorpayOrder = orderRes.data.order;

      // 4. Setup Razorpay options and open Modal
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency,
        name: "EcomBlue Premium",
        description: `Subscription for ${plan.name} (${plan.duration_days} Days)`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#2563eb", // blue-600
        },
        handler: async function (response) {
          setPaymentLoadingId(plan.id);
          try {
            // 5. Verify Razorpay signature on backend
            const verifyRes = await api.post(
              `${CATEGORY_API}/subscription/verify-payment`,
              {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                planId: plan.id,
              },
              { headers }
            );

            if (verifyRes.data.success) {
              setSuccessMessage(`Plan "${plan.name}" successfully activated! Thank you for subscribing.`);
              // Refresh subscription details
              await fetchData();
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            alert("Error verifying payment signature. Please contact support.");
          } finally {
            setPaymentLoadingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoadingId(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Subscription payment checkout error:", err);
      alert("An unexpected error occurred during checkout.");
      setPaymentLoadingId(null);
    }
  };

  const parseFeatures = (desc) => {
    if (!desc) return [];
    return desc
      .split(/[\n,;]+/)
      .map((f) => f.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
        <p className="text-gray-500 font-semibold text-sm">Loading premium membership plans...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Club
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4 sm:text-5xl">
            Choose Your Subscription Plan
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Unlock exclusive cashback offers, free premium shipping, priority product support, and elite member coupons.
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="max-w-xl mx-auto mb-12 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-center text-sm font-semibold shadow-sm animate-bounce">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mb-12 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Pricing Cards Grid */}
        {plans.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No active plans available</h3>
            <p className="text-sm text-gray-500 mt-2">Currently, there are no subscription plans available for purchase. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isCurrent = activeSub && activeSub.planId === plan.id;
              const features = parseFeatures(plan.description);

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl shadow-md border p-8 relative flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                    isCurrent
                      ? "border-blue-600 ring-4 ring-blue-50/50 scale-[1.01]"
                      : "border-gray-150"
                  }`}
                >
                  {/* Current Active Plan Ribbon */}
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                      Current Active Plan
                    </span>
                  )}

                  <div>
                    {/* Plan Name */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-black text-gray-800 tracking-tight capitalize">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                        Membership Program
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline mb-6 text-gray-900">
                      <span className="text-5xl font-black tracking-tight">₹{Math.round(plan.price)}</span>
                      <span className="text-sm font-semibold text-gray-400 ml-2">
                        / {plan.duration_days} Days
                      </span>
                    </div>

                    {/* Features List */}
                    <div className="border-t border-gray-100 pt-6 mb-8">
                      <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4">
                        What's included in this plan:
                      </p>
                      {features.length > 0 ? (
                        <ul className="space-y-4">
                          {features.map((feat, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full p-0.5 mt-0.5 shrink-0">
                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              </span>
                              <span className="text-sm font-semibold text-gray-600 leading-normal">
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No specific features described.</p>
                      )}
                    </div>
                  </div>

                  {/* Buy Button / Active indicator */}
                  <div className="mt-auto">
                    {isCurrent ? (
                      <div className="w-full h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold rounded-xl flex items-center justify-center gap-2 text-sm shadow-inner">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Plan Activated</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuyPlan(plan)}
                        disabled={paymentLoadingId !== null}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:bg-gray-200 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow hover:shadow-md transition-all text-sm uppercase tracking-wider cursor-pointer"
                      >
                        {paymentLoadingId === plan.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <span>Subscribe Now</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Footer Info */}
                    <p className="text-[10px] text-gray-400 text-center font-bold tracking-wide mt-3.5 uppercase">
                      {isCurrent
                        ? `Valid until ${new Date(activeSub.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`
                        : "Instant activation via Razorpay"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Benefits banner */}
        <div className="mt-20 max-w-4xl mx-auto border border-gray-200 bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-50 border border-amber-100 text-amber-500 p-3 rounded-2xl shrink-0">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-1">Need help choosing a plan?</h4>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                Contact our customer support team 24/7. We can help recommend the right plan for your shopping habits.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile?tab=settings")}
            className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-6 py-3 rounded-xl shadow shrink-0 tracking-wider transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
