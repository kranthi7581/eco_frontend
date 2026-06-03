import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { Mail, Lock, User, ArrowRight, ShoppingBag, X } from "lucide-react";

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup, loading, authModalMessage } = useUser();
  
  // Decide whether to show login or register first
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (isLogin) {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } else {
      const res = await signup(username, email, password);
      if (res.success) {
        setSuccessMessage(res.message + ". Please sign in below.");
        setIsLogin(true);
        // Clean fields
        setUsername("");
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container Card */}
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-250">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all hover:scale-105 active:scale-95 z-30"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Branding Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-8 text-center text-white relative">
          {/* Decorative shapes */}
          <div className="absolute top-[-50px] right-[-50px] w-28 h-28 rounded-full bg-blue-500/30 blur-sm" />
          <div className="absolute bottom-[-30px] left-[-30px] w-20 h-20 rounded-full bg-blue-500/20 blur-sm" />
          
          <div className="inline-flex bg-white/20 p-3 rounded-2xl mb-3 backdrop-blur-md">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            EcomBlue Shop
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            {isLogin ? "Please sign in to unlock your cart & complete order" : "Create a new buyer account to buy products"}
          </p>
        </div>

        {/* Form Area */}
        <div className="p-8">
          
          {/* Custom Auth Message */}
          {authModalMessage && (
            <div className="mb-6 p-3.5 bg-blue-50 border-l-4 border-blue-600 text-blue-800 text-xs font-extrabold rounded-r-xl text-center shadow-sm">
              {authModalMessage}
            </div>
          )}

          {/* Notification Messages */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Username field (Register Only) */}
            {!isLogin && (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl pl-10 pr-4 text-sm focus:outline-none transition-all"
                />
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl pl-10 pr-4 text-sm focus:outline-none transition-all"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl pl-10 pr-4 text-sm focus:outline-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none mt-6 text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Register Now"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>

          {/* Toggle Switch */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
            >
              {isLogin 
                ? "Don't have an account? Register here" 
                : "Already have an account? Sign In here"}
            </button>
          </div>

          {/* Disabled Continue as Guest Action (Checkout Stage) */}
          {authModalMessage && (
            <div className="mt-4 pt-4 border-t border-gray-150 flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="w-full h-11 bg-gray-50 text-gray-400 font-bold rounded-xl text-xs flex items-center justify-center cursor-not-allowed border border-gray-200/60"
              >
                Continue as Guest (Login required for checkout)
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AuthModal;
