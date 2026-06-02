import { useState } from "react";
import { AUTH_API } from "../../repo/Apis";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.user?.role !== "admin") {
          setMessage("Access denied. Verify you have signed in using your Administrator credentials.");
          setIsSubmitting(false);
          return;
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage(data.message || "Login successful");
        console.log(data);
        navigate("/admin/dashboard");
      } else {
        setMessage(data.message || "Login failed. Please check your credentials.");
        console.error("Login failed", data);
      }
    } catch (error) {
      setMessage("Unable to connect to the login API");
      console.error("Error during login:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#134fe6] overflow-hidden font-sans select-none">
      {/* Background decoration lines/waves */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Left bottom concentric circles */}
        <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -left-48 w-[750px] h-[750px] rounded-full border border-white/10" />
        <div className="absolute -bottom-64 -left-64 w-[950px] h-[950px] rounded-full border border-white/10" />
      </div>

      {/* Main Form Content Container */}
      <div className="relative z-10 w-full max-w-[360px] px-4 flex flex-col items-center">
        {/* Custom Shopping Cart Icon matching the reference image */}
        <div className="mb-4 text-white">
          <svg className="w-20 h-20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 100 100">
            {/* Basket path (open top) */}
            <path d="M 28 25 L 39 64 L 71 64 L 81 38 L 86 38" strokeLinecap="round" strokeLinejoin="round" />
            {/* Arrow pointing up */}
            <path d="M 55 24 L 55 53" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 46 33 L 55 24 L 64 33" strokeLinecap="round" strokeLinejoin="round" />
            {/* Wheels */}
            <circle cx="45" cy="76" r="4.5" fill="none" strokeWidth="2.5" />
            <circle cx="65" cy="76" r="4.5" fill="none" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Titles */}
        <div className="text-center mb-8 select-none">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">EcomDemo</h1>
          <p className="text-white/80 text-sm tracking-wide mt-1">Admin Panel Login</p>
        </div>

        {/* Validation Message Display */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg border text-sm w-full text-center ${
            message.toLowerCase().includes("successful")
              ? "bg-green-500/20 border-green-500/30 text-green-200"
              : "bg-red-500/20 border-red-500/30 text-red-200"
          }`}>
            <span>{message}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Email input field (USERNAME) */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/90">
              <User size={18} />
            </span>
            <input
              type="email"
              required
              placeholder="USERNAME"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-white/10 border border-white hover:border-white/90 focus:border-white rounded-md pl-12 pr-4 text-white placeholder:text-white/60 focus:outline-none transition-all duration-200 text-sm tracking-wider font-medium"
            />
          </div>

          {/* Password input field */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/90">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-white/10 border border-white hover:border-white/90 focus:border-white rounded-md pl-12 pr-12 text-white placeholder:text-white/60 focus:outline-none transition-all duration-200 text-sm tracking-wider font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 flex items-center justify-center bg-white text-[#134fe6] hover:bg-white/95 active:scale-[0.98] font-bold rounded-md uppercase tracking-wider text-sm transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none shadow-md"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#134fe6] border-t-transparent" />
            ) : (
              <span>LOGIN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
