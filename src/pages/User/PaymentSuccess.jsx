import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle2, ShoppingCart, Calendar, MapPin, Receipt, ArrowRight } from "lucide-react";

const PaymentSuccess = () => {
  const location = useLocation();
  const state = location.state;

  // Protect page from direct entry without completing order
  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { orderId, address, totalAmount, paymentMethod } = state;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Container Card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center relative overflow-hidden">
        
        {/* Decorative background shapes */}
        <div className="absolute top-[-40px] right-[-40px] w-24 h-24 rounded-full bg-emerald-50" />
        <div className="absolute bottom-[-40px] left-[-40px] w-24 h-24 rounded-full bg-emerald-50" />

        {/* 1. Success checkmark Animation */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6 relative z-10 animate-bounce">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
          Payment Success!
        </h1>
        <p className="text-sm text-gray-500 font-semibold mb-6">
          Your order has been placed and is currently processing.
        </p>

        {/* Order Details Panel */}
        <div className="bg-gray-50 rounded-2xl p-5 text-left border border-gray-150 space-y-4 mb-8 text-xs relative z-10">
          
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Order ID</span>
            <span className="font-extrabold text-slate-800">#{orderId}</span>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block">Estimated Delivery</span>
              <p className="font-bold text-gray-700 mt-1">Within 2-3 business days</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block">Delivery Address</span>
              <p className="font-semibold text-gray-600 mt-1 leading-normal truncate-3-lines">{address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 border-t border-gray-200 pt-3">
            <Receipt className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block">Total Amount Paid</span>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                ₹{Number(totalAmount).toLocaleString("en-IN")}{" "}
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase ml-2 tracking-wide">
                  {paymentMethod}
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 relative z-10">
          <Link
            to="/products"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Continue Shopping
          </Link>
          
          <Link
            to="/profile?tab=orders"
            className="w-full h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs sm:text-sm"
          >
            <span>Track your Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default PaymentSuccess;
