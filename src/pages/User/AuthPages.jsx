import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, ShoppingBag } from "lucide-react";

const AuthPages = () => {
  const { login, signup, loading } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Decide whether to show login or register first
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        // Redirect to target redirect route or homepage
        const redirect = searchParams.get("redirect") || "/";
        navigate(redirect);
      } else {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Container Card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Top Branding Section */}
        <div className="bg-blue-600 px-6 py-8 text-center text-white relative">
          {/* Decorative shapes */}
          <div className="absolute top-[-50px] right-[-50px] w-28 h-28 rounded-full bg-blue-500/30" />
          <div className="absolute bottom-[-30px] left-[-30px] w-20 h-20 rounded-full bg-blue-500/20" />
          
          <div className="inline-flex bg-white/20 p-3 rounded-2xl mb-3 backdrop-blur-md">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            EcomBlue Shop
          </h2>
          <p className="text-blue-100 text-xs mt-1">
            {isLogin ? "Sign in to access products, cart & orders" : "Create a new buyer account"}
          </p>
        </div>

        {/* Form Area */}
        <div className="p-8">
          
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

          {/* Demo/Testing Info Banner */}
          {isLogin && (
            <div className="mt-8 border-t border-gray-100 pt-5 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Testing the App?
              </span>
              <p className="text-xs text-gray-500 leading-normal">
                If you don't have an account, switch to <strong>Register</strong> and create one, then use those credentials to log in and test.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AuthPages;
