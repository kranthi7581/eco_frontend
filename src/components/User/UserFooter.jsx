import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ShoppingBag } from "lucide-react";

const UserFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Top Banner/Newsletter section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">Subscribe to our newsletter</h3>
            <p className="text-sm text-slate-400">Get the latest updates on new product launches, special offers, and discounts.</p>
          </div>
          <div className="w-full md:w-auto flex max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full md:w-64 bg-slate-800 border border-slate-700 text-white rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-r-lg text-sm font-semibold transition-colors shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Col 1: About EcomBlue */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="bg-blue-600 text-white p-2 rounded-lg transition-colors shadow">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Ecom<span className="text-blue-500">Blue</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Your ultimate destination for quality products, unmatched pricing, and super-fast delivery. Shop electronics, fashion, groceries, and beauty items in just a few clicks.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-full transition-all text-slate-400" title="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-blue-400 hover:text-white rounded-full transition-all text-slate-400" title="Twitter">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-pink-600 hover:text-white rounded-full transition-all text-slate-400" title="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-blue-700 hover:text-white rounded-full transition-all text-slate-400" title="LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/products" className="hover:text-white hover:underline transition-colors">All Products</Link>
            </li>
            <li>
              <Link to="/profile?tab=orders" className="hover:text-white hover:underline transition-colors">Track Orders</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white hover:underline transition-colors">Shopping Cart</Link>
            </li>
            <li>
              <Link to="/profile?tab=wishlist" className="hover:text-white hover:underline transition-colors">My Wishlist</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Policy & Support */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Policies & Support</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-white hover:underline transition-colors">About Us</a>
            </li>
            <li>
              <a href="#" className="hover:text-white hover:underline transition-colors">Contact Support</a>
            </li>
            <li>
              <a href="#" className="hover:text-white hover:underline transition-colors">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-white hover:underline transition-colors">Terms & Conditions</a>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact Us */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contact Info</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>123 Tech Park, Phase 1, Bangalore, Karnataka, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <span>support@ecomblue.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="bg-slate-950 py-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center">
          <p>&copy; {new Date().getFullYear()} EcomBlue Shop. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Security Details</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default UserFooter;
