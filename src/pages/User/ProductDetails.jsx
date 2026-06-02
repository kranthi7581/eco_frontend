import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { useUser } from "../../context/UserContext";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  ChevronRight, 
  Minus, 
  Plus, 
  MessageSquareHeart,
  HelpCircle
} from "lucide-react";
import ProductCard from "../../components/User/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, addToWishlist, removeFromWishlist, token, user } = useUser();

  // States
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistUpdating, setWishlistUpdating] = useState(false);

  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [userOrdersList, setUserOrdersList] = useState([]);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");
  const [devBypass, setDevBypass] = useState(false);

  const isWishlisted = wishlist.some(
    (item) => Number(item.productId) === Number(id)
  );

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const tokenVal = localStorage.getItem("token");
      const headers = tokenVal ? { Authorization: `Bearer ${tokenVal}` } : {};

      // 1. Fetch Product
      const prodRes = await api.get(`${CATEGORY_API}/products/${id}`, { headers });
      if (prodRes.data && prodRes.data.product) {
        const prod = prodRes.data.product;
        setProduct(prod);
        setSelectedImage(prod.image ? `${CATEGORY_API}${prod.image}` : "");
        
        // 2. Fetch Related Products (same category)
        const allRes = await api.get(`${CATEGORY_API}/products`, { headers });
        if (allRes.data && Array.isArray(allRes.data.products)) {
          const related = allRes.data.products.filter(
            (item) => Number(item.categoryId) === Number(prod.categoryId) && Number(item.id) !== Number(prod.id)
          );
          setRelatedProducts(related.slice(0, 4));
        }
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      // Endpoint is /review/product/:productId
      const response = await api.get(`${CATEGORY_API}/review/product/${id}`);
      if (response.data && Array.isArray(response.data.reviews)) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    if (!token) return;
    try {
      const response = await api.get(`${CATEGORY_API}/orders`);
      if (response.data && Array.isArray(response.data.orders)) {
        const filtered = response.data.orders.filter(ord => {
          const items = ord.OrderItems || ord.orderItems || [];
          return items.some(item => Number(item.productId) === Number(id));
        });
        setUserOrdersList(filtered);
      }
    } catch (err) {
      console.error("Error fetching orders for review:", err);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
    fetchUserOrders();
    setQuantity(1);
    setShowReviewForm(false);
    setReviewComment("");
    setReviewSubmitMessage("");
    setDevBypass(false);
    setReviewOrderId("");
  }, [id]);

  const handleWishlistToggle = async () => {
    if (!token) {
      alert("Please log in to save items to your wishlist.");
      return;
    }
    setWishlistUpdating(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistUpdating(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      alert("Please log in to add items to your cart.");
      return;
    }
    setAddingToCart(true);
    // Add multiple quantities by loop or single add then update quantity
    const res = await addToCart(id);
    if (res && res.success) {
      // If quantity is more than 1, we sync quantity too
      if (quantity > 1) {
        await api.put(`${CATEGORY_API}/cart/update/${id}`, { quantity });
      }
      alert("Added to cart successfully!");
    } else {
      alert(res?.message || "Failed to add item to cart.");
    }
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!token) {
      alert("Please log in to make a purchase.");
      return;
    }
    setAddingToCart(true);
    const res = await addToCart(id);
    if (res && res.success) {
      if (quantity > 1) {
        await api.put(`${CATEGORY_API}/cart/update/${id}`, { quantity });
      }
      setAddingToCart(false);
      navigate("/cart");
    } else {
      alert(res?.message || "Failed to initiate purchase.");
      setAddingToCart(false);
    }
  };

  // Submit review form
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId: Number(id),
        rating: Number(reviewRating),
        comment: reviewComment
      };
      if (reviewOrderId) {
        payload.orderId = Number(reviewOrderId);
      }
      await api.post(`${CATEGORY_API}/review`, payload);
      setReviewSubmitMessage("Review submitted successfully!");
      setReviewComment("");
      setReviewOrderId("");
      setShowReviewForm(false);
      fetchReviews();
    } catch (err) {
      setReviewSubmitMessage(err.response?.data?.message || "Failed to submit review.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
        <p className="text-gray-500 mt-4 text-sm font-medium">Fetching details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The product you are trying to view does not exist or was deleted.</p>
        <Link to="/" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow">
          Back to Home
        </Link>
      </div>
    );
  }

  const discountPercent = 10 + ((product.id * 7) % 25);
  const originalPrice = (product.price * (1 + discountPercent / 100)).toFixed(0);

  // Generate fallback mockup reviews if backend returns none to display a beautiful screen
  const dummyReviews = [
    { id: 1, User: { username: "Aditya Kumar" }, rating: 5, comment: "Superb product! Reached in 2 days. The performance is solid, very happy with this purchase.", createdAt: "2026-05-15T12:00:00Z" },
    { id: 2, User: { username: "Sneha Patel" }, rating: 4, comment: "Valuable product for the price. Build quality is neat and operates perfectly.", createdAt: "2026-05-18T10:30:00Z" }
  ];
  const reviewsToDisplay = reviews.length > 0 ? reviews : dummyReviews;

  const defaultImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600";
  const mainImage = selectedImage || defaultImageUrl;

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:underline">Catalog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-semibold truncate max-w-[150px]">{product.name}</span>
          </div>
        </div>

        {/* Main Details Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Left: Product Image Gallery */}
          <div className="flex flex-col gap-4">
            
            {/* Large Show Box */}
            <div className="aspect-square w-full rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center p-6 relative">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-500"
              />
              
              {/* Sale Tag */}
              {discountPercent > 15 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider shadow">
                  Sale -{discountPercent}%
                </span>
              )}
            </div>

            {/* Mock Thumbnail gallery */}
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedImage(product.image ? `${CATEGORY_API}${product.image}` : defaultImageUrl)}
                className={`aspect-square border-2 rounded-xl overflow-hidden bg-gray-50 p-1 transition-all ${
                  mainImage === (product.image ? `${CATEGORY_API}${product.image}` : defaultImageUrl)
                    ? "border-blue-600"
                    : "border-gray-200"
                }`}
              >
                <img src={product.image ? `${CATEGORY_API}${product.image}` : defaultImageUrl} alt="Main" className="w-full h-full object-contain" />
              </button>
              
              {/* 3 Alternate mock views */}
              {[
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300",
                "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=300",
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=300"
              ].map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(url)}
                  className={`aspect-square border-2 rounded-xl overflow-hidden bg-gray-50 p-1 transition-all ${
                    mainImage === url ? "border-blue-600" : "border-gray-200"
                  }`}
                >
                  <img src={url} alt={`View ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </div>

          {/* Right: Technical Attributes & Call To Actions */}
          <div className="flex flex-col justify-between">
            <div>
              
              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Price section */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                <span className="text-base text-gray-400 line-through">
                  ₹{Number(originalPrice).toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded">
                  {discountPercent}% OFF
                </span>
              </div>

              {/* Stock status & badges */}
              <div className="flex items-center gap-3 mb-6">
                {product.quantity > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Available Stock ({product.quantity} items left)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product description */}
              <div className="border-t border-gray-100 pt-5 mb-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description || "This high quality item is built to professional standards. Featuring optimized ergonomics, robust builds, and top tier specs. Fully verified in store catalog, matching modern household or lifestyle needs."}
                </p>
              </div>

              {/* Delivery items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-600">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Free Express Delivery by tomorrow</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Secure checkout and 1 year warranty</span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.quantity > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-bold text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 text-sm font-bold text-gray-800 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.quantity <= 0}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-blue-600/10 text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart ? "Adding to Cart..." : "Add to Cart"}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={addingToCart || product.quantity <= 0}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-950 disabled:bg-gray-300 text-white rounded-xl font-bold flex items-center justify-center transition-all active:scale-[0.98] text-sm"
              >
                Buy Now
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={wishlistUpdating}
                className={`h-12 w-12 border rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center shrink-0 ${
                  isWishlisted
                    ? "border-red-200 text-red-500 bg-red-50"
                    : "border-gray-300 text-gray-600 hover:text-red-500"
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-blue-600" />
                Customer Reviews
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Hear from people who purchased this item.</p>
            </div>
            
            {token && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
              >
                {showReviewForm ? "Cancel Review" : "Write a Review"}
              </button>
            )}
          </div>

          {/* Write review form */}
          {/* Write review form */}
          {showReviewForm && (
            <div>
              {userOrdersList.length === 0 && !devBypass ? (
                <div className="mb-8 text-xs text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100 leading-normal flex flex-col gap-2 max-w-xl">
                  <span className="font-semibold">Verified Review Required</span>
                  <span>Only customers who have purchased this specific product can submit a verified review.</span>
                  <div className="flex gap-4 mt-2">
                    <Link to="/products" className="text-blue-600 font-bold hover:underline">
                      Continue Shopping &rarr;
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDevBypass(true)}
                      className="text-gray-400 font-bold hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      Bypass verification (Developer Test Mode)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mb-8 bg-gray-50 p-5 rounded-2xl border border-gray-200 max-w-xl animate-in slide-in-from-top-4 duration-200">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Post a verified review</h3>
                  
                  {reviewSubmitMessage && (
                    <div className="mb-3 text-xs font-bold text-blue-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                      {reviewSubmitMessage}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Render Order ID field ONLY if we are in devBypass mode */}
                    {devBypass && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                          Developer Test: Enter Mock Order ID
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 1"
                          value={reviewOrderId}
                          onChange={(e) => setReviewOrderId(e.target.value)}
                          className="w-full bg-white border border-gray-200 text-sm font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    )}

                    {/* Rating selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Star className={`w-6 h-6 ${star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment box */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Your Comment</label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Describe your experience with this product..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Reviews list */}
          {reviewsLoading ? (
            <div className="py-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {reviewsToDisplay.map((rev) => (
                <div key={rev.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center uppercase">
                        {(rev.User?.username || "A").substring(0, 2)}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{rev.User?.username || "Customer"}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>

                  {/* Rating star render */}
                  <div className="flex text-amber-400 mb-2">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="w-full">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;
