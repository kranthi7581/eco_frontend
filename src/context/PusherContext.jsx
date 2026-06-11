import { createContext, useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useUser } from "./UserContext";
import { ShoppingBag, X } from "lucide-react";

const PusherContext = createContext();

export const usePusher = () => useContext(PusherContext);

export const PusherProvider = ({ children }) => {
  const { user } = useUser();
  const [toasts, setToasts] = useState([]);

  const addToast = (orderId, customerName, totalAmount, order) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, orderId, customerName, totalAmount, order }]);
    
    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Only initialize Pusher notification system if user is an admin
    if (!user || user.role !== "admin") {
      setToasts([]); // Clear any lingering toasts on logout
      return;
    }

    const appKey = import.meta.env.VITE_PUSHER_APP_KEY;
    const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

    if (!appKey || !cluster) {
      console.warn("[Pusher] Connection keys are missing in frontend .env");
      return;
    }

    // Enable Pusher logging in development
    if (import.meta.env.DEV) {
      Pusher.logToConsole = true;
    }

    console.log("[Pusher] Connecting to Pusher...");
    const pusherClient = new Pusher(appKey, {
      cluster,
      forceTLS: true,
    });

    const channel = pusherClient.subscribe("admin-orders");
    console.log("[Pusher] Subscribed to channel 'admin-orders'");

    // Bind event for new order notifications
    channel.bind("new-order", (data) => {
      console.log("[Pusher] Event 'new-order' received:", data);
      
      // Trigger user-visible notification
      addToast(data.orderId, data.customerName, data.totalAmount, data.order);

      // Play alert sound (using a public URL for standard notification sound)
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
        audio.volume = 0.4;
        audio.play().catch(() => {
          // Playback blocked by browser policy (until user interaction)
        });
      } catch (audioErr) {
        console.warn("[Pusher] Sound play blocked or failed:", audioErr);
      }

      // Dispatch a custom DOM Event for orders page to intercept
      window.dispatchEvent(
        new CustomEvent("new-order-alert", {
          detail: data,
        })
      );
    });

    return () => {
      console.log("[Pusher] Cleaning up connection...");
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [user]);

  return (
    <PusherContext.Provider value={{ toasts, removeToast }}>
      {/* Dynamic Keyframes for smooth UI slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-toast-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {children}

      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-150 shadow-2xl rounded-2xl p-4 flex gap-4 transition-all duration-300 transform translate-y-0 scale-100 hover:scale-[1.02] cursor-pointer animate-toast-slide-in"
            style={{
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
            }}
          >
            {/* Notification Icon Badge */}
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>

            {/* Notification Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">New Order Placed</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <p className="text-sm font-extrabold text-gray-800 mt-1">
                Order #{toast.orderId}
              </p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">
                Customer: <span className="font-semibold text-gray-700 capitalize">{toast.customerName}</span>
              </p>
              <p className="text-xs font-bold text-blue-600 mt-2">
                Amount: ₹{Number(toast.totalAmount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </PusherContext.Provider>
  );
};
