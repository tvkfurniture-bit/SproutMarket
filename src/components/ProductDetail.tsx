import { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { 
  Star, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  MapPin, 
  RefreshCw, 
  CreditCard, 
  ShieldCheck, 
  Award, 
  Info, 
  BadgeCheck, 
  Plus 
} from 'lucide-react';
import { lookupPincode, formatINR } from '../utils';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  isAiMatch?: boolean;
  globalPincode: string;
  globalPincodeCity: string;
  onPincodeChange: (pin: string, city: string) => void;
}

const getCompanionItem = (currentId: string): Product => {
  if (currentId === 'p2') {
    return {
      id: 'p5',
      name: 'Echeveria Rose (Lola Succulent)',
      scientificName: 'Echeveria "Lola"',
      description: 'A delicate succulent rosette with pale gray-blue leaves tinged with pink.',
      price: 199,
      rating: 4.6,
      reviewsCount: 42,
      category: 'succulents',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600&h=600',
      nurseryId: 'n2',
      nurseryName: 'Deccan Succulents & Palms',
      stock: 30,
      light: 'direct',
      water: 'low',
      difficulty: 'easy',
      features: ['Compact Size', 'Pet Friendly', 'Geometric Rosette'],
      size: 'Small (3" grower pot)',
      isPrime: false
    };
  }
  return {
    id: 'p2',
    name: 'Snake Plant Laurentii',
    scientificName: 'Sansevieria trifasciata',
    description: 'One of the hardiest houseplants available in India.',
    price: 349,
    rating: 4.9,
    reviewsCount: 204,
    category: 'indoor',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600&h=600',
    nurseryId: 'n1',
    nurseryName: 'Himalayan Greens Nursery',
    stock: 45,
    light: 'low',
    water: 'low',
    difficulty: 'easy',
    features: ['Air Purifying', 'Low Maintenance', 'Drought Tolerant'],
    size: 'Small (4" grower pot)',
    isPrime: true
  };
};

const tonicItem: Product = {
  id: 'p9',
  name: 'Organic Panchagavya Plant Tonic',
  scientificName: 'N/A (Care Product)',
  description: 'A traditional Indian organic growth booster made from cow dung, urine, milk, curd, and ghee.',
  price: 249,
  rating: 4.8,
  reviewsCount: 156,
  category: 'pots-soil',
  image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600&h=600',
  nurseryId: 'n3',
  nurseryName: 'Western Ghats Organic Nursery',
  stock: 100,
  light: 'indirect',
  water: 'moderate',
  difficulty: 'easy',
  features: ['100% Organic', 'All-Purpose', 'Nutrient Rich'],
  size: '500ml Spray Bottle',
  isPrime: true
};

export default function ProductDetail({ 
  product, 
  onBack, 
  onAddToCart, 
  onBuyNow,
  isAiMatch,
  globalPincode,
  globalPincodeCity,
  onPincodeChange
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Amazon-style states
  const [mainImage, setMainImage] = useState(product.image);
  const [applyCoupon, setApplyCoupon] = useState(false);
  
  // Frequently Bought Together States
  const [fbtChecked2, setFbtChecked2] = useState(true);
  const [fbtChecked3, setFbtChecked3] = useState(true);
  const [fbtSuccessMsg, setFbtSuccessMsg] = useState('');
  
  // Custom reviews state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Gemini Q&A state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [loadingQa, setLoadingQa] = useState(false);
  const [qaError, setQaError] = useState('');

  const [localPin, setLocalPin] = useState(globalPincode);
  const [localPinError, setLocalPinError] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  useEffect(() => {
    setLocalPin(globalPincode);
  }, [globalPincode]);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const info = lookupPincode(localPin);
    if (info) {
      setLocalPinError('');
      onPincodeChange(localPin, `${info.city}, ${info.state}`);
      setShowPinInput(false);
    } else {
      setLocalPinError('Enter valid 6-digit Indian PIN (e.g. 400001, 110001)');
    }
  };

  const getDeliveryEstimate = () => {
    const info = lookupPincode(globalPincode);
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    
    if (!info) {
      const standardDate = new Date(today);
      standardDate.setDate(today.getDate() + 3);
      return {
        text: `FREE Delivery by ${standardDate.toLocaleDateString('en-IN', options)}`,
        isPrimeSpeed: false
      };
    }
    
    if (product.isPrime && info.isPrimeEligible) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return {
        text: `FREE One-Day Delivery by Tomorrow, ${tomorrow.toLocaleDateString('en-IN', options)}`,
        isPrimeSpeed: true
      };
    } else {
      const estDate = new Date(today);
      estDate.setDate(today.getDate() + info.estDays + 1);
      return {
        text: `FREE Delivery by ${estDate.toLocaleDateString('en-IN', options)}`,
        isPrimeSpeed: false
      };
    }
  };

  const deliveryEst = getDeliveryEstimate();

  // Fetch reviews for this product
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews/${product.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // Reset Q&A and quantity when switching products
    setQuantity(1);
    setQaAnswer('');
    setQaQuestion('');
    setQaError('');
    setMainImage(product.image);
    setApplyCoupon(false);
  }, [product]);

  const companionItem = getCompanionItem(product.id);

  const handleAddFbtToCart = () => {
    // Current item
    onAddToCart(product, 1);
    
    // Companion item
    if (fbtChecked2) {
      onAddToCart(companionItem, 1);
    }
    
    // Tonic item
    if (fbtChecked3) {
      onAddToCart(tonicItem, 1);
    }
    
    setFbtSuccessMsg('🎉 Added selected bundle items to your botanical cart!');
    setTimeout(() => {
      setFbtSuccessMsg('');
    }, 4000);
  };

  // Submit standard product review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewName || 'Anonymous Gardener',
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (response.ok) {
        setReviewComment('');
        setReviewName('');
        setReviewRating(5);
        fetchReviews(); // reload reviews
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Ask Gemini Assistant about this plant
  const handleAskSpecialist = async (preSetQuestion?: string) => {
    const questionToAsk = preSetQuestion || qaQuestion;
    if (!questionToAsk.trim()) return;

    setLoadingQa(true);
    setQaError('');
    setQaAnswer('');
    try {
      const response = await fetch('/api/gemini/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          productDescription: product.description,
          question: questionToAsk
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQaAnswer(data.answer);
      } else {
        const data = await response.json();
        setQaError(data.error || 'The plant care specialist is currently asleep. Please try again soon.');
      }
    } catch (err) {
      setQaError('Could not connect to the plant nursery. Please verify your server connection.');
    } finally {
      setLoadingQa(false);
    }
  };

  const getDifficultyDesc = (diff: string) => {
    switch (diff) {
      case 'easy': return 'Highly forgiving. Can handle missed waterings and fluctuating light.';
      case 'medium': return 'Moderate routines. Enjoys consistent watering schedules and steady indirect sun.';
      case 'hard': return 'Demanding collector. Requires specific humidity levels, exact light, and careful feeding.';
      default: return '';
    }
  };

  return (
    <div id="product-detail-view" className="max-w-6xl mx-auto px-4 py-8 text-brand-text">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-brand-text-muted hover:text-brand-primary font-medium mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Botanical Catalog</span>
      </button>

      {/* Main Product Layout (Amazon 3-Column Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Column 1: Image Showcase & Thumbnails (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
          {/* Thumbnails Sidebar */}
          <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-x-visible">
            {[
              { id: 't1', src: product.image, label: 'Main View' },
              { id: 't2', src: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400', label: 'Nursery Cultivation' },
              { id: 't3', src: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=400', label: 'Lifestyle Decor' }
            ].map((thumb) => (
              <button
                key={thumb.id}
                onClick={() => setMainImage(thumb.src)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-stone-50 shrink-0 ${
                  mainImage === thumb.src ? 'border-amber-500 ring-2 ring-amber-100' : 'border-stone-200 hover:border-amber-500/50'
                }`}
                title={thumb.label}
              >
                <img src={thumb.src} alt={thumb.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

          {/* Main Visual Display */}
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-stone-200 shadow-xs aspect-square bg-stone-50 order-1 sm:order-2">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            {isAiMatch && (
              <div className="absolute top-4 left-4 flex items-center gap-1 bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow-md animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300/20" />
                <span>99% AI MATCH</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Core Details & Coupons (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline"
            >
              Visit the {product.nurseryName} Store
            </a>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight leading-tight mt-1">
              {product.name}
            </h1>
            <p className="text-xs italic text-emerald-800 font-semibold mt-0.5">{product.scientificName}</p>
          </div>

          {/* Ratings Summary */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 border-b border-stone-200 pb-3">
            <div className="flex items-center text-amber-500 font-bold">
              <span className="mr-1">{product.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-stone-200'}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-stone-300">|</span>
            <a href="#reviews-section" className="text-blue-600 hover:text-blue-800 hover:underline">
              {product.reviewsCount} verified ratings
            </a>
          </div>

          {/* Price breakdown with Amazon labels */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#b12704] font-sans">
                {formatINR(product.price - (applyCoupon ? 50 : 0))}
              </span>
              <span className="text-xs text-stone-500">
                M.R.P.: <span className="line-through">{formatINR(Math.round(product.price * 1.35))}</span>
              </span>
              <span className="text-xs text-emerald-700 font-bold">
                (Save {Math.round((1 - (product.price - (applyCoupon ? 50 : 0)) / (product.price * 1.35)) * 100)}%)
              </span>
            </div>
            <p className="text-[10px] text-stone-500">Inclusive of all organic Indian grower taxes.</p>
          </div>

          {/* Amazon Green Coupon Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="amazon-coupon-check"
              checked={applyCoupon}
              onChange={(e) => setApplyCoupon(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
            />
            <label htmlFor="amazon-coupon-check" className="text-xs text-stone-700 font-bold cursor-pointer select-none">
              <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black mr-1.5 uppercase">
                Coupon
              </span>
              Apply ₹50 coupon.
              <span className="block text-[10px] text-stone-500 font-medium mt-0.5">
                Discount will be applied at secure checkout checkout.
              </span>
            </label>
          </div>

          {/* Fast Spec Highlights */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-stone-200 text-center">
            <div className="text-[10px]">
              <span className="block text-stone-400 font-bold uppercase tracking-wider">Sunlight</span>
              <strong className="block text-stone-800 capitalize mt-0.5">☀️ {product.light}</strong>
            </div>
            <div className="text-[10px]">
              <span className="block text-stone-400 font-bold uppercase tracking-wider">Watering</span>
              <strong className="block text-stone-800 capitalize mt-0.5">💧 {product.water}</strong>
            </div>
            <div className="text-[10px]">
              <span className="block text-stone-400 font-bold uppercase tracking-wider">Care Level</span>
              <strong className="block text-stone-800 capitalize mt-0.5">🌱 {product.difficulty}</strong>
            </div>
          </div>

          {/* Plant Bio */}
          <div className="prose prose-stone">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-400">About this item</h4>
            <p className="text-stone-600 text-xs leading-relaxed mt-1">{product.description}</p>
          </div>

          {/* Premium Tags */}
          <div className="flex flex-wrap gap-1.5">
            {product.features.map((feature, idx) => (
              <span
                key={idx}
                className="bg-stone-100 border border-stone-200 text-stone-700 text-[10px] px-2.5 py-1 rounded-full font-bold"
              >
                🌿 {feature}
              </span>
            ))}
          </div>

          {/* Amazon Bank Offers Row */}
          <div className="space-y-2 mt-4 pt-4 border-t border-stone-200">
            <span className="block text-[11px] font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#b12704]" /> Save Extra with Bank Offers
            </span>
            <div className="grid grid-cols-3 gap-2 overflow-x-auto pb-1">
              <div className="border border-stone-200 hover:border-amber-500 rounded-xl p-2.5 bg-white text-left transition-all flex flex-col justify-between min-h-[90px] shadow-2xs">
                <div>
                  <span className="block text-[9px] font-extrabold text-[#b12704] uppercase tracking-wider">Bank Offer</span>
                  <span className="block text-[9px] text-stone-800 font-bold mt-1 line-clamp-2 leading-tight">
                    10% Instant Discount on SBI Credit Cards
                  </span>
                </div>
                <span className="text-[8px] text-blue-600 hover:underline cursor-pointer font-bold mt-1.5 block">
                  1 offer &gt;
                </span>
              </div>

              <div className="border border-stone-200 hover:border-amber-500 rounded-xl p-2.5 bg-white text-left transition-all flex flex-col justify-between min-h-[90px] shadow-2xs">
                <div>
                  <span className="block text-[9px] font-extrabold text-[#b12704] uppercase tracking-wider">Partner Offer</span>
                  <span className="block text-[9px] text-stone-800 font-bold mt-1 line-clamp-2 leading-tight">
                    Get 5% cashback on Sprout Wallet
                  </span>
                </div>
                <span className="text-[8px] text-blue-600 hover:underline cursor-pointer font-bold mt-1.5 block">
                  Details &gt;
                </span>
              </div>

              <div className="border border-stone-200 hover:border-amber-500 rounded-xl p-2.5 bg-white text-left transition-all flex flex-col justify-between min-h-[90px] shadow-2xs">
                <div>
                  <span className="block text-[9px] font-extrabold text-[#b12704] uppercase tracking-wider">No Cost EMI</span>
                  <span className="block text-[9px] text-stone-800 font-bold mt-1 line-clamp-2 leading-tight">
                    Zero Interest EMI on top credit cards
                  </span>
                </div>
                <span className="text-[8px] text-blue-600 hover:underline cursor-pointer font-bold mt-1.5 block">
                  EMI Options &gt;
                </span>
              </div>
            </div>
          </div>

          {/* Amazon Policy Trust Badges Row */}
          <div className="grid grid-cols-5 gap-1 text-center py-4 border-t border-b border-stone-150 bg-stone-50/50 rounded-xl mt-4 px-1.5">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-3xs">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-bold text-stone-800 mt-1 leading-tight block">
                7 Days Return
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-3xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-bold text-stone-800 mt-1 leading-tight block">
                Sprout Safe
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-3xs">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-bold text-stone-800 mt-1 leading-tight block">
                Top Grower
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-3xs">
                <BadgeCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-bold text-stone-800 mt-1 leading-tight block">
                Secure SSL
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-3xs">
                <span className="text-xs">🇮🇳</span>
              </div>
              <span className="text-[8px] font-bold text-stone-800 mt-1 leading-tight block">
                Organic Born
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: The Amazon Buy Box (lg:col-span-3) */}
        <div className="lg:col-span-3 bg-white border border-stone-250 rounded-2xl p-4.5 shadow-sm space-y-4">
          <div>
            <span className="text-xl font-black text-stone-900 font-sans">
              {formatINR(product.price - (applyCoupon ? 50 : 0))}
            </span>
            {product.isPrime && (
              <span className="inline-flex items-center text-[10px] text-blue-600 font-extrabold italic tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 ml-1.5">
                prime
              </span>
            )}
          </div>

          {/* Delivery speed estimate */}
          <div className="text-xs space-y-1">
            <p className="text-stone-800">
              {deliveryEst.isPrimeSpeed ? (
                <>
                  <strong className="text-green-700 font-black">FREE One-Day Delivery</strong> by <span className="font-bold">Tomorrow</span>
                </>
              ) : (
                <>
                  <strong className="text-stone-900 font-extrabold">FREE standard delivery</strong>
                </>
              )}
            </p>
            <p className="text-[10px] text-stone-500 font-medium">
              Estimated arrival: <span className="text-stone-800 font-bold">{deliveryEst.text.split('by')[1] || deliveryEst.text}</span>
            </p>
          </div>

          {/* Location Pincode widget */}
          <div className="border-t border-b border-stone-100 py-3 text-xs">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Deliver to</p>
                <p className="font-bold text-stone-800 truncate leading-tight mt-0.5">
                  Amit - {globalPincodeCity} {globalPincode}
                </p>
                <button
                  onClick={() => setShowPinInput(!showPinInput)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline mt-1 cursor-pointer block"
                >
                  {showPinInput ? 'Cancel Change' : 'Change PIN Code'}
                </button>
              </div>
            </div>

            {showPinInput && (
              <form onSubmit={handleCheckPincode} className="flex gap-2 mt-2.5 animate-fade-in">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="PIN e.g. 400001"
                  value={localPin}
                  onChange={(e) => setLocalPin(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 text-xs border border-stone-300 rounded-lg px-2 py-1.5 bg-stone-50 focus:outline-amber-500 font-mono"
                />
                <button
                  type="submit"
                  className="bg-[#f08804] hover:bg-[#df7d03] text-stone-950 font-bold text-[10px] px-3.5 rounded-lg cursor-pointer"
                >
                  Check
                </button>
              </form>
            )}
            {localPinError && (
              <p className="text-red-600 text-[10px] mt-1 font-bold leading-none">{localPinError}</p>
            )}
          </div>

          {/* Stock status */}
          <div>
            {product.stock > 0 ? (
              <p className="text-emerald-700 font-bold text-sm">In Stock.</p>
            ) : (
              <p className="text-red-600 font-bold text-sm">Currently Unavailable.</p>
            )}
            <p className="text-[10px] text-stone-500 font-medium mt-0.5">
              Sold by <span className="text-blue-600 hover:underline cursor-pointer">{product.nurseryName}</span> and Fulfilled by SproutMarket.
            </p>
          </div>

          {/* Qty Dropdown (if in stock) */}
          {product.stock > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-semibold">Quantity:</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 focus:outline-amber-500 text-stone-850 font-bold"
              >
                {[...Array(Math.min(10, product.stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onAddToCart(product, quantity)}
              disabled={product.stock === 0}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-stone-950 font-extrabold text-xs py-2.5 rounded-full border border-[#fcd200] shadow-xs cursor-pointer transition-colors"
            >
              Add to Gardening Cart
            </button>
            <button
              onClick={() => onBuyNow(product, quantity)}
              disabled={product.stock === 0}
              className="w-full bg-[#ffa41c] hover:bg-[#f3a847] text-stone-950 font-extrabold text-xs py-2.5 rounded-full border border-[#ffd814] shadow-xs cursor-pointer transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>

      </div>

      {/* Amazon Frequently Bought Together Bundle */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-12 shadow-2xs">
        <h3 className="text-lg font-bold text-stone-900 mb-5">Frequently bought together</h3>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Images loop with plus icons */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative border border-stone-200 rounded-xl p-1 bg-stone-50">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-16 h-16 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 bg-amber-500 text-stone-950 text-[8px] font-black px-1 rounded-sm">This Item</span>
            </div>

            <Plus className="w-4 h-4 text-stone-400 shrink-0" />

            <div className={`relative border border-stone-200 rounded-xl p-1 bg-stone-50 transition-opacity duration-200 ${fbtChecked2 ? 'opacity-100' : 'opacity-40'}`}>
              <img 
                src={companionItem.image} 
                alt={companionItem.name} 
                className="w-16 h-16 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 bg-stone-800 text-white text-[8px] font-black px-1 rounded-sm">Companion</span>
            </div>

            <Plus className="w-4 h-4 text-stone-400 shrink-0" />

            <div className={`relative border border-stone-200 rounded-xl p-1 bg-stone-50 transition-opacity duration-200 ${fbtChecked3 ? 'opacity-100' : 'opacity-40'}`}>
              <img 
                src={tonicItem.image} 
                alt={tonicItem.name} 
                className="w-16 h-16 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 bg-emerald-700 text-white text-[8px] font-black px-1 rounded-sm">Nutrition</span>
            </div>
          </div>

          {/* Checkboxes and purchase button */}
          <div className="flex-1 space-y-2 text-xs">
            {/* Checkbox 1 */}
            <div className="flex items-start gap-2.5">
              <input 
                type="checkbox" 
                checked 
                disabled 
                className="mt-0.5 rounded text-amber-500 border-stone-300 opacity-70"
              />
              <p className="text-stone-700 font-medium leading-normal">
                <span className="font-bold text-stone-900">This item:</span> {product.name} <span className="text-[#b12704] font-bold">{formatINR(product.price)}</span>
              </p>
            </div>

            {/* Checkbox 2 */}
            <div className="flex items-start gap-2.5">
              <input 
                type="checkbox" 
                id="fbt-companion"
                checked={fbtChecked2} 
                onChange={(e) => setFbtChecked2(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 border-stone-300 focus:ring-amber-400 cursor-pointer"
              />
              <label htmlFor="fbt-companion" className="text-stone-700 font-medium leading-normal cursor-pointer select-none">
                <span className="font-bold text-stone-900">Companion Plant:</span> {companionItem.name} <span className="text-blue-600 hover:underline">[{companionItem.size}]</span> <span className="text-[#b12704] font-bold">{formatINR(companionItem.price)}</span>
              </label>
            </div>

            {/* Checkbox 3 */}
            <div className="flex items-start gap-2.5">
              <input 
                type="checkbox" 
                id="fbt-tonic"
                checked={fbtChecked3} 
                onChange={(e) => setFbtChecked3(e.target.checked)}
                className="mt-0.5 rounded text-amber-500 border-stone-300 focus:ring-amber-400 cursor-pointer"
              />
              <label htmlFor="fbt-tonic" className="text-stone-700 font-medium leading-normal cursor-pointer select-none">
                <span className="font-bold text-stone-900">Botanical Booster:</span> {tonicItem.name} <span className="text-blue-600 hover:underline">[500ml Bio-Spray]</span> <span className="text-[#b12704] font-bold">{formatINR(tonicItem.price)}</span>
              </label>
            </div>

            {/* Price and Add button */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4">
              <div>
                <span className="text-stone-600 text-xs font-semibold">Total Price: </span>
                <span className="text-base font-extrabold text-[#b12704]">
                  {formatINR(product.price + (fbtChecked2 ? companionItem.price : 0) + (fbtChecked3 ? tonicItem.price : 0))}
                </span>
              </div>
              
              <button
                onClick={handleAddFbtToCart}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-stone-950 font-extrabold text-[11px] px-5 py-2 rounded-lg border border-[#fcd200] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                Add {1 + (fbtChecked2 ? 1 : 0) + (fbtChecked3 ? 1 : 0)} items to Gardening Cart
              </button>
            </div>

            {fbtSuccessMsg && (
              <p className="text-emerald-700 font-bold text-xs mt-2 animate-fade-in">{fbtSuccessMsg}</p>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Plant Care Specifications (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-serif font-bold text-brand-primary border-b border-brand-border pb-3">
            Botanical Care Guidelines
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sun Card */}
            <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
              <span className="text-2xl mb-2 block">☀️</span>
              <h3 className="font-bold text-sm text-brand-text mb-1 capitalize">{product.light} Sunlight</h3>
              <p className="text-brand-text-muted text-xs leading-relaxed">
                {product.light === 'low' && 'Thrives in dark corners, bathroom light, or offices away from windows.'}
                {product.light === 'indirect' && 'Prefers bright, dappled sunlight. Avoid placing in hot direct rays.'}
                {product.light === 'direct' && 'Enjoys deep, direct sun exposure. Great for windowsills or outdoors.'}
              </p>
            </div>

            {/* Water Card */}
            <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
              <span className="text-2xl mb-2 block">💧</span>
              <h3 className="font-bold text-sm text-brand-text mb-1 capitalize">{product.water} Hydration</h3>
              <p className="text-brand-text-muted text-xs leading-relaxed">
                {product.water === 'low' && 'Drought tolerant. Water only once the soil is 100% dry.'}
                {product.water === 'moderate' && 'Allow the top 2 inches of soil to fully dry between waterings.'}
                {product.water === 'high' && 'Enjoys rich, moist soil. Water consistently before soil dries.'}
              </p>
            </div>

            {/* Difficulty Card */}
            <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
              <span className="text-2xl mb-2 block">🌱</span>
              <h3 className="font-bold text-sm text-brand-text mb-1 capitalize">{product.difficulty} Difficulty</h3>
              <p className="text-brand-text-muted text-xs leading-relaxed">
                {getDifficultyDesc(product.difficulty)}
              </p>
            </div>
          </div>
        </div>

        {/* Gemini AI Q&A Widget (Right Column) */}
        <div className="bg-brand-muted rounded-2xl border border-brand-border p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-brand-primary text-white p-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 fill-brand-accent/20 text-brand-accent" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-brand-primary leading-tight">AI Care Specialist</h3>
              <p className="text-[10px] text-brand-green-muted font-bold">Real-time Nursery Support</p>
            </div>
          </div>
          
          <p className="text-xs text-brand-text-muted mb-4 leading-relaxed">
            Ask specific questions about caring for this <strong>{product.name}</strong> at your home.
          </p>

          {/* Quick Helper Questions */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => {
                setQaQuestion('Is this plant safe for dogs and cats?');
                handleAskSpecialist('Is this plant safe for dogs and cats?');
              }}
              className="text-[10px] bg-white border border-brand-border hover:border-brand-primary text-brand-text-muted px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              🐾 Safe for cats/dogs?
            </button>
            <button
              onClick={() => {
                setQaQuestion('What are the warning signs of overwatering?');
                handleAskSpecialist('What are the warning signs of overwatering?');
              }}
              className="text-[10px] bg-white border border-brand-border hover:border-brand-primary text-brand-text-muted px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              ⚠️ Overwater warning signs?
            </button>
            <button
              onClick={() => {
                setQaQuestion('When should I repot this and what soil is best?');
                handleAskSpecialist('When should I repot this and what soil is best?');
              }}
              className="text-[10px] bg-white border border-brand-border hover:border-brand-primary text-brand-text-muted px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              🪴 Best soil & repotting?
            </button>
          </div>

          {/* Chat Window */}
          <div className="space-y-3 mb-4">
            {loadingQa && (
              <div className="bg-white/80 rounded-xl p-4 border border-brand-border flex items-center justify-center gap-2 text-brand-text-muted text-xs shadow-xs">
                <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                <span>Consulting nursery doctor...</span>
              </div>
            )}

            {qaError && (
              <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-xs leading-relaxed flex gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{qaError}</span>
              </div>
            )}

            {qaAnswer && !loadingQa && (
              <div className="bg-brand-accent/40 text-brand-text border border-brand-primary/10 rounded-xl p-3.5 text-xs leading-relaxed shadow-xs">
                <p className="font-semibold text-brand-primary mb-1.5 font-serif italic">🌱 Specialist Advice:</p>
                <div className="whitespace-pre-line text-brand-text/90">{qaAnswer}</div>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskSpecialist();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask: 'Will it thrive in my cold room?'"
              value={qaQuestion}
              onChange={(e) => setQaQuestion(e.target.value)}
              className="flex-1 text-xs border border-brand-border rounded-xl px-3 py-2 bg-white focus:outline-brand-primary text-brand-text placeholder-brand-text-muted/60"
            />
            <button
              type="submit"
              disabled={loadingQa || !qaQuestion.trim()}
              className="bg-brand-primary text-white p-2 rounded-xl hover:opacity-95 transition-colors disabled:bg-brand-border disabled:text-brand-text-muted cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Amazon.in Technical Details & Product Comparison */}
      <div className="border-t border-stone-200 pt-10 mb-16 space-y-12 animate-fade-in">
        {/* Technical Details Section */}
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-5">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 border border-stone-200 rounded-xl overflow-hidden bg-white text-xs shadow-3xs">
            <div className="flex border-b border-stone-150">
              <span className="w-1/3 bg-stone-50 p-3 font-bold text-stone-600 border-r border-stone-150 shrink-0">Botanical Name</span>
              <span className="w-2/3 p-3 text-stone-800 font-medium italic">{product.scientificName}</span>
            </div>
            <div className="flex border-b border-stone-150">
              <span className="w-1/3 bg-stone-50 p-3 font-bold text-stone-600 border-r border-stone-150 shrink-0">Nursery Grower</span>
              <span className="w-2/3 p-3 text-stone-850 font-bold">{product.nurseryName}</span>
            </div>
            <div className="flex border-b border-stone-150 md:border-b-0">
              <span className="w-1/3 bg-stone-50 p-3 font-bold text-stone-600 border-r border-stone-150 shrink-0">Country of Origin</span>
              <span className="w-2/3 p-3 text-stone-800 font-medium">India 🇮🇳</span>
            </div>
            <div className="flex border-b border-stone-150 md:border-b-0">
              <span className="w-1/3 bg-stone-50 p-3 font-bold text-stone-600 border-r border-stone-150 shrink-0">Packaging Size</span>
              <span className="w-2/3 p-3 text-stone-800 font-medium">{product.size}</span>
            </div>
            <div className="flex border-b border-stone-150 md:border-b-0">
              <span className="w-1/3 bg-stone-50 p-3 font-bold text-stone-600 border-r border-stone-150 shrink-0">Organic Cert No</span>
              <span className="w-2/3 p-3 text-stone-800 font-mono font-bold text-emerald-700">IN-ORG-982845</span>
            </div>
            <div className="flex">
              <span className="w-1/3 bg-stone-50 p-3 font-bold text-stone-600 border-r border-stone-150 shrink-0">Included Components</span>
              <span className="w-2/3 p-3 text-stone-800 font-medium">1x Grower Pot, Soil Mix, Care Booklet</span>
            </div>
          </div>
        </div>

        {/* Product Comparison Matrix Table */}
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-2">
            Compare with similar items <span className="bg-blue-100 text-blue-800 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Top rated</span>
          </h3>
          <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-1/4 min-w-[150px]">Attributes</th>
                  <th className="p-4 w-1/4 min-w-[180px] bg-amber-50/20 text-stone-900 font-bold border-l border-stone-150">
                    This Item ({product.name.split('(')[0].trim()})
                  </th>
                  <th className="p-4 w-1/4 min-w-[180px] border-l border-stone-150">
                    {companionItem.name.split('(')[0].trim()}
                  </th>
                  <th className="p-4 w-1/4 min-w-[180px] border-l border-stone-150">
                    Sacred Tulsi Starter
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {/* Image row */}
                <tr>
                  <td className="p-4 font-bold text-stone-600 bg-stone-50/30">Product Image</td>
                  <td className="p-4 bg-amber-50/10 border-l border-stone-150">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                  </td>
                  <td className="p-4 border-l border-stone-150">
                    <img src={companionItem.image} alt={companionItem.name} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                  </td>
                  <td className="p-4 border-l border-stone-150">
                    <img src="https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=200&h=200" alt="Sacred Tulsi" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                  </td>
                </tr>

                {/* Price Row */}
                <tr>
                  <td className="p-4 font-bold text-stone-600 bg-stone-50/30">Price</td>
                  <td className="p-4 bg-amber-50/10 border-l border-stone-150 font-black text-[#b12704] text-sm">
                    {formatINR(product.price)}
                  </td>
                  <td className="p-4 border-l border-stone-150 font-bold text-stone-800 text-sm">
                    {formatINR(companionItem.price)}
                  </td>
                  <td className="p-4 border-l border-stone-150 font-bold text-stone-800 text-sm">
                    ₹99
                  </td>
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="p-4 font-bold text-stone-600 bg-stone-50/30">Customer Rating</td>
                  <td className="p-4 bg-amber-50/10 border-l border-stone-150">
                    <div className="font-bold text-amber-600 flex items-center gap-1">
                      <span>★ {product.rating}</span>
                      <span className="text-stone-400 font-normal">({product.reviewsCount})</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-stone-150">
                    <div className="font-bold text-amber-600 flex items-center gap-1">
                      <span>★ {companionItem.rating}</span>
                      <span className="text-stone-400 font-normal">({companionItem.reviewsCount})</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-stone-150">
                    <div className="font-bold text-amber-600 flex items-center gap-1">
                      <span>★ 4.8</span>
                      <span className="text-stone-400 font-normal">(142)</span>
                    </div>
                  </td>
                </tr>

                {/* Sunlight Row */}
                <tr>
                  <td className="p-4 font-bold text-stone-600 bg-stone-50/30">Sunlight Needs</td>
                  <td className="p-4 bg-amber-50/10 border-l border-stone-150 capitalize font-medium">{product.light} Sunlight</td>
                  <td className="p-4 border-l border-stone-150 capitalize font-medium">{companionItem.light} Sunlight</td>
                  <td className="p-4 border-l border-stone-150 capitalize font-medium">Direct Sunlight</td>
                </tr>

                {/* Water Row */}
                <tr>
                  <td className="p-4 font-bold text-stone-600 bg-stone-50/30">Water Level</td>
                  <td className="p-4 bg-amber-50/10 border-l border-stone-150 capitalize font-medium">{product.water} Watering</td>
                  <td className="p-4 border-l border-stone-150 capitalize font-medium">{companionItem.water} Watering</td>
                  <td className="p-4 border-l border-stone-150 capitalize font-medium">High Watering</td>
                </tr>

                {/* Care Level */}
                <tr>
                  <td className="p-4 font-bold text-stone-600 bg-stone-50/30">Care Level</td>
                  <td className="p-4 bg-amber-50/10 border-l border-stone-150 capitalize">
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold text-[10px]">{product.difficulty}</span>
                  </td>
                  <td className="p-4 border-l border-stone-150 capitalize">
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-bold text-[10px]">{companionItem.difficulty}</span>
                  </td>
                  <td className="p-4 border-l border-stone-150 capitalize">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">easy</span>
                  </td>
                </tr>

                {/* Size Row */}
                <tr>
                  <td className="p-4 font-bold text-stone-600 bg-stone-50/30">Size</td>
                  <td className="p-4 bg-amber-50/10 border-l border-stone-150 font-medium">{product.size}</td>
                  <td className="p-4 border-l border-stone-150 font-medium">{companionItem.size}</td>
                  <td className="p-4 border-l border-stone-150 font-medium">Small (3.5" peat pot)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reviews and Ratings Section */}
      <div id="reviews-section" className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-brand-border pt-10">
        {/* Reviews Left Column (Overall Scores & Add Review Form) */}
        <div>
          <h3 className="text-xl font-serif font-bold text-brand-primary mb-6">Customer Reviews</h3>
          
          {/* Average Rating Box */}
          <div className="bg-brand-muted border border-brand-border rounded-2xl p-5 mb-8 text-center sm:text-left">
            <div className="sm:flex items-center gap-4">
              <span className="text-5xl font-serif font-black text-brand-primary leading-none block mb-2 sm:mb-0">
                {product.rating}
              </span>
              <div>
                <div className="flex justify-center sm:justify-start items-center text-brand-warm mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-brand-warm text-brand-warm' : 'text-brand-border'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-brand-text-muted font-medium">Based on {reviews.length} nursery buyers</p>
              </div>
            </div>
          </div>

          {/* Add a Review Form */}
          <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs">
            <h4 className="font-bold text-sm text-brand-primary mb-4">Write a Verified Review</h4>
            
            <div className="mb-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="e.g., Jane G."
                className="w-full border border-brand-border rounded-xl p-2 text-xs focus:outline-brand-primary bg-brand-muted text-brand-text placeholder-brand-text-muted/50"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setReviewRating(starVal)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer text-brand-warm"
                  >
                    <Star className={`w-5 h-5 ${starVal <= reviewRating ? 'fill-brand-warm text-brand-warm' : 'text-brand-border'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                Comment
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this nursery plant..."
                rows={3}
                required
                className="w-full border border-brand-border rounded-xl p-2 text-xs focus:outline-brand-primary bg-brand-muted text-brand-text placeholder-brand-text-muted/50"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submittingReview || !reviewComment.trim()}
              className="w-full bg-brand-primary hover:opacity-90 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors cursor-pointer"
            >
              {submittingReview ? 'Submitting...' : 'Post Nursery Review'}
            </button>
          </form>
        </div>

        {/* Reviews List (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-2">
            <h4 className="font-bold text-sm text-brand-text">Buyer Stories</h4>
            <span className="text-xs text-brand-text-muted font-medium">{reviews.length} Reviews posted</span>
          </div>

          {loadingReviews ? (
            <div className="py-10 text-center text-brand-text-muted text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              <span>Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border-2 border-dashed border-brand-border text-brand-text-muted text-xs bg-white">
              Be the first to review this organic plant!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-brand-text">{rev.userName}</h5>
                          {rev.isVerified && (
                            <span className="flex items-center gap-0.5 text-[9px] bg-brand-accent text-brand-primary font-semibold px-1.5 py-0.5 rounded-full border border-brand-primary/10">
                              <CheckCircle2 className="w-2.5 h-2.5 fill-brand-accent text-brand-primary" />
                              <span>Verified Nursery Buyer</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-text-muted">{rev.date}</span>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center text-brand-warm">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-brand-warm text-brand-warm' : 'text-brand-border'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-brand-text-muted text-xs leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
