import { useState, useEffect } from 'react';
import { Product, CartItem, Order, QuizAnswers } from './types';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import AIDoctor from './components/AIDoctor';
import AIMatchmaker from './components/AIMatchmaker';
import NurseryPortal from './components/NurseryPortal';
import { lookupPincode, formatINR } from './utils';
import { 
  Sprout, 
  ShoppingBag, 
  Search, 
  X, 
  TrendingUp, 
  ShieldCheck, 
  Lock,
  SlidersHorizontal, 
  History, 
  Store, 
  Heart,
  Sparkles,
  Info,
  Loader2,
  MapPin,
  Clock,
  QrCode,
  Check,
  CreditCard,
  Truck,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'doctor' | 'finder' | 'nursery' | 'orders' | 'checkout'>('browse');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Indian Pincode Delivery States
  const [pincode, setPincode] = useState(() => localStorage.getItem('india_pincode') || '400001');
  const [pincodeCity, setPincodeCity] = useState(() => localStorage.getItem('india_pincode_city') || 'Mumbai, Maharashtra');
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeModalError, setPincodeModalError] = useState('');

  // Indian Payment States
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeTimer, setQrCodeTimer] = useState(180);

  // Lightning Deals Timer (Remaining seconds until end of the day)
  const [secondsLeftToday, setSecondsLeftToday] = useState(14400); // starts around 4 hours

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNurseryFilter, setSelectedNurseryFilter] = useState<string>('all');
  const [selectedLight, setSelectedLight] = useState<string>('all');
  const [selectedWater, setSelectedWater] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // AI Finder match results profile
  const [aiMatchProfile, setAiMatchProfile] = useState<{
    persona: string;
    profileMarkdown: string;
    recommendedCategories: string[];
    recommendedFeatures: string[];
  } | null>(null);

  // Cart calculation states
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [shippingType, setShippingType] = useState<'ground' | 'heatpack'>('ground');
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Fetch initial products
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Timers for Lightning Deals and UPI QR Code
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeftToday(prev => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrCode && qrCodeTimer > 0) {
      interval = setInterval(() => {
        setQrCodeTimer(prev => prev - 1);
      }, 1000);
    } else if (qrCodeTimer === 0) {
      setShowQrCode(false);
    }
    return () => clearInterval(interval);
  }, [showQrCode, qrCodeTimer]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  // Sync products in portal addition
  const handleProductAdded = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    // Visual alert or drawer pop
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    // Overwrite or set quantity
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setSelectedProduct(null);
    setIsCartOpen(false);
    setActiveTab('checkout');
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Promo discount code apply
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'SPRINGSPROUT') {
      setAppliedDiscount(0.15); // 15% discount
      setPromoMessage('Promo code SPRINGSPROUT applied: 15% discount!');
    } else if (code === 'GREENLOVE') {
      setAppliedDiscount(0.20); // 20% discount
      setPromoMessage('Promo code GREENLOVE applied: 20% discount!');
    } else {
      setPromoMessage('Invalid promo code. Try "SPRINGSPROUT" or "GREENLOVE".');
      setAppliedDiscount(0);
    }
  };

  // Simulated Checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim() || cart.length === 0) return;

    setCheckingOut(true);
    setTimeout(() => {
      const orderTotal = calculateCartTotal();
      const newOrder: Order = {
        id: 'ord_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toISOString().split('T')[0],
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          nurseryName: item.product.nurseryName
        })),
        total: orderTotal,
        status: 'Processing',
        shippingAddress
      };

      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setShippingAddress('');
      setPromoCode('');
      setAppliedDiscount(0);
      setPromoMessage('');
      setCheckingOut(false);
      setCheckoutSuccess(true);
      setIsCartOpen(false);
      setActiveTab('orders'); // switch to order history

      // auto dismiss success
      setTimeout(() => setCheckoutSuccess(false), 8000);
    }, 1500);
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        let nextStatus: 'Processing' | 'Shipped' | 'Delivered' = 'Processing';
        if (ord.status === 'Processing') nextStatus = 'Shipped';
        else if (ord.status === 'Shipped') nextStatus = 'Delivered';
        else nextStatus = 'Processing';
        return { ...ord, status: nextStatus };
      }
      return ord;
    }));
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = cartSubtotal * appliedDiscount;
  
  // Prime Delivery eligibility check: all products are Prime and the current Indian Pincode is in a Prime hub
  const isPrimeDeliverable = cart.length > 0 && cart.every(item => item.product.isPrime) && !!lookupPincode(pincode)?.isPrimeEligible;
  
  const shippingFee = shippingType === 'heatpack' 
    ? (isPrimeDeliverable ? 0 : 99) 
    : (cartSubtotal > 499 ? 0 : 49);

  const calculateCartTotal = () => {
    return Math.round(cartSubtotal - discountAmount + shippingFee);
  };

  // Search and filter logic
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.nurseryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesNursery = selectedNurseryFilter === 'all' || prod.nurseryId === selectedNurseryFilter;
    const matchesLight = selectedLight === 'all' || prod.light === selectedLight;
    const matchesWater = selectedWater === 'all' || prod.water === selectedWater;
    const matchesDifficulty = selectedDifficulty === 'all' || prod.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesNursery && matchesLight && matchesWater && matchesDifficulty;
  });

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'indoor': return 'Indoor Plants';
      case 'outdoor': return 'Outdoor Plants';
      case 'succulents': return 'Succulents & Cacti';
      case 'herbs': return 'Herbs & Seeds';
      case 'pots-soil': return 'Pots & Soil';
      case 'care-tools': return 'Care Tools';
      default: return 'Botanical Catalog';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col justify-between">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#131921] border-b border-[#232f3e] text-white">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left Block: Logo + Pincode */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer p-1 rounded hover:outline hover:outline-1 hover:outline-white/30"
              onClick={() => {
                setSelectedProduct(null);
                setActiveTab('browse');
              }}
            >
              <div className="bg-emerald-600 text-stone-50 p-1.5 sm:p-2 rounded-lg shadow-xs">
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">SproutMarket</span>
                  <span className="text-[8px] bg-blue-500 text-white font-extrabold italic px-1 rounded-sm leading-tight">prime</span>
                </div>
                <p className="text-[8px] uppercase tracking-wider text-amber-400 font-bold mt-0.5">Nursery Direct India</p>
              </div>
            </div>

            {/* Pincode Selector Widget */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:outline hover:outline-1 hover:outline-white/30 cursor-pointer text-left shrink-0 transition-all"
              onClick={() => {
                setPincodeInput(pincode);
                setPincodeModalError('');
                setIsPincodeModalOpen(true);
              }}
              title="Change Delivery Location"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-[10px] leading-tight">
                <span className="block text-[8px] text-stone-400 font-medium">Deliver to</span>
                <span className="font-bold text-white block leading-none mt-0.5">
                  {pincodeCity.split(',')[0]} {pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('browse'); }}
              className={`font-bold transition-colors cursor-pointer py-1.5 px-2.5 rounded hover:bg-white/5 ${activeTab === 'browse' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-300 hover:text-white'}`}
            >
              Shop India Catalog
            </button>
            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('doctor'); }}
              className={`font-bold transition-colors cursor-pointer py-1.5 px-2.5 rounded hover:bg-white/5 ${activeTab === 'doctor' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-300 hover:text-white'}`}
            >
              AI Plant Doctor
            </button>
            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('finder'); }}
              className={`font-bold transition-colors cursor-pointer py-1.5 px-2.5 rounded hover:bg-white/5 ${activeTab === 'finder' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-300 hover:text-white'}`}
            >
              Matchmaker Quiz
            </button>
            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('nursery'); }}
              className={`font-bold transition-colors cursor-pointer py-1.5 px-2.5 rounded hover:bg-white/5 ${activeTab === 'nursery' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-stone-300 hover:text-white'}`}
            >
              Grower Portal
            </button>
          </nav>

          {/* Right Controls (Cart, Order History) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Orders icon */}
            <button
              onClick={() => { setSelectedProduct(null); setActiveTab('orders'); }}
              className={`p-2 rounded hover:outline hover:outline-1 hover:outline-white/30 cursor-pointer relative ${activeTab === 'orders' ? 'text-amber-400' : 'text-stone-300'}`}
              title="My Orders"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5" />
              {orders.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-stone-950 text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Shopping Cart button in Amazon Gold style */}
            <button
              id="shopping-cart-toggle"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="bg-[#f08804] hover:bg-[#df7d03] text-stone-950 px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 font-extrabold text-xs transition-colors cursor-pointer relative"
            >
              <ShoppingBag className="w-4 h-4 text-stone-950" />
              <span className="hidden sm:inline">Gardening Cart</span>
              <span className="bg-[#131921] text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-black">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex justify-around border-t border-stone-200/60 py-2.5 bg-white text-stone-500 text-[10px] font-bold">
          <button 
            onClick={() => { setSelectedProduct(null); setActiveTab('browse'); }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'browse' ? 'text-emerald-800' : ''}`}
          >
            <span>🌿</span>
            <span>Catalog</span>
          </button>
          <button 
            onClick={() => { setSelectedProduct(null); setActiveTab('doctor'); }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'doctor' ? 'text-emerald-800' : ''}`}
          >
            <span>🩺</span>
            <span>AI Doctor</span>
          </button>
          <button 
            onClick={() => { setSelectedProduct(null); setActiveTab('finder'); }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'finder' ? 'text-emerald-800' : ''}`}
          >
            <span>🔮</span>
            <span>Quiz Match</span>
          </button>
          <button 
            onClick={() => { setSelectedProduct(null); setActiveTab('nursery'); }}
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'nursery' ? 'text-emerald-800' : ''}`}
          >
            <span>🚜</span>
            <span>Growers</span>
          </button>
        </div>
      </header>

      {/* Main Body Containers */}
      <main className="flex-1">
        
        {/* Checkout Success Banner */}
        {checkoutSuccess && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 text-emerald-950 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
              <div className="flex gap-4 items-start text-center sm:text-left">
                <span className="text-3xl">🎉</span>
                <div>
                  <h4 className="font-extrabold text-sm">Purchase Successfully Simulated!</h4>
                  <p className="text-xs text-stone-600 mt-0.5">Your plant has been dispatched to packing queue. View tracker below.</p>
                </div>
              </div>
              <button 
                onClick={() => setCheckoutSuccess(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 1. BROWSE CATALOG TAB */}
        {activeTab === 'browse' && (
          <div>
            {/* If a product is selected, display product detail page instead of grid */}
            {selectedProduct ? (
              <ProductDetail
                product={selectedProduct}
                onBack={() => setSelectedProduct(null)}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                isAiMatch={aiMatchProfile?.recommendedCategories.includes(selectedProduct.category)}
                globalPincode={pincode}
                globalPincodeCity={pincodeCity}
                onPincodeChange={(pin, city) => {
                  setPincode(pin);
                  setPincodeCity(city);
                  localStorage.setItem('india_pincode', pin);
                  localStorage.setItem('india_pincode_city', city);
                }}
              />
            ) : (
              <div>
                {/* Hero section */}
                <div className="bg-emerald-950 text-stone-50 py-12 lg:py-16 mb-8 border-b border-emerald-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
                  <div className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    
                    {/* Left Intro text */}
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>100% Certified Organic Growers</span>
                      </div>
                      <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight leading-none">
                        Premium Nurseries, <br />
                        <span className="text-emerald-400">Direct To Your Door.</span>
                      </h1>
                      <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
                        Browse real botanical specimens cultivated by family-owned greenhouse farms. Take the Matchmaker Quiz to unlock custom AI matches with 99% survival suitability!
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveTab('finder')}
                          className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs px-5 py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4 fill-emerald-950 text-emerald-950" />
                          <span>Unlock AI Match Finder</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('doctor')}
                          className="bg-emerald-900 hover:bg-emerald-850 border border-emerald-800 text-emerald-300 font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
                        >
                          Diagnose Sick Plant
                        </button>
                      </div>
                    </div>

                    {/* Right visual highlights */}
                    <div className="hidden md:grid grid-cols-2 gap-4">
                      <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                        <span className="text-xl">☀️</span>
                        <div>
                          <h4 className="font-bold text-xs">Care Climatized</h4>
                          <p className="text-[10px] text-stone-400 mt-0.5">Every plant is hardened in active environments before shipping.</p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                        <span className="text-xl">🚚</span>
                        <div>
                          <h4 className="font-bold text-xs">Cardboard Pods</h4>
                          <p className="text-[10px] text-stone-400 mt-0.5">Secure, ventilated patented root packaging prevents spillages.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Great Indian Plant Festival — Lightning Deals Banner */}
                <div className="max-w-7xl mx-auto px-4 mb-10">
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-emerald-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded animate-pulse">
                            Deal of the Day
                          </span>
                          <h2 className="text-base font-extrabold text-[#111] tracking-tight">
                            Great Indian Plant Festival — Lightning Deals
                          </h2>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          Limited time nursery-direct organic markdowns. Fresh healthy foliage shipped in protective climate-pods.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-amber-300 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-850 self-stretch md:self-auto justify-center">
                        <Clock className="w-4 h-4 text-red-600 animate-pulse" />
                        <span>Ends in:</span>
                        <span className="font-mono text-red-600 tracking-wider text-sm">{formatTimer(secondsLeftToday)}</span>
                      </div>
                    </div>

                    {/* Lightning Deal horizontal strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          id: 'p6',
                          name: 'Sacred Tulsi Starter',
                          tagline: 'Ayurvedic & Immunity booster',
                          dealPrice: 79,
                          originalPrice: 99,
                          claimed: 84,
                          image: 'https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80&w=400',
                          nursery: 'Western Ghats Organic'
                        },
                        {
                          id: 'p2',
                          name: 'Snake Plant Laurentii',
                          tagline: 'Striking golden sword margins',
                          dealPrice: 249,
                          originalPrice: 349,
                          claimed: 68,
                          image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=400',
                          nursery: 'Himalayan Greens'
                        },
                        {
                          id: 'p1',
                          name: 'Monstera Ganesh Leaf',
                          tagline: 'Thrives in warm humid room corners',
                          dealPrice: 499,
                          originalPrice: 699,
                          claimed: 45,
                          image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=400',
                          nursery: 'Himalayan Greens'
                        }
                      ].map((deal) => {
                        const productItem = products.find(p => p.id === deal.id);
                        return (
                          <div 
                            key={deal.id}
                            onClick={() => {
                              if (productItem) {
                                setSelectedProduct(productItem);
                              }
                            }}
                            className="bg-white border border-stone-200 hover:border-amber-500 rounded-xl p-3 flex gap-3 cursor-pointer hover:shadow-md transition-all duration-300"
                          >
                            <img 
                              src={deal.image} 
                              alt={deal.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-stone-100 shrink-0 bg-stone-50"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                                {deal.nursery}
                              </span>
                              <h4 className="font-extrabold text-xs text-stone-900 truncate leading-tight mt-0.5">
                                {deal.name}
                              </h4>
                              <p className="text-[10px] text-stone-500 truncate leading-none mt-0.5">{deal.tagline}</p>
                              
                              <div className="flex items-baseline gap-1.5 mt-2">
                                <span className="text-sm font-black text-red-600 font-sans">{formatINR(deal.dealPrice)}</span>
                                <span className="text-[10px] text-stone-400 line-through font-sans">{formatINR(deal.originalPrice)}</span>
                                <span className="text-[9px] text-emerald-700 font-bold">({Math.round((1 - deal.dealPrice/deal.originalPrice)*100)}% off)</span>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-2.5">
                                <div className="flex justify-between text-[9px] font-bold text-stone-500 mb-1">
                                  <span>{deal.claimed}% claimed</span>
                                  <span className="text-amber-600">Limited Stock</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${deal.claimed}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Filter and Browse Section */}
                <div className="max-w-7xl mx-auto px-4 pb-16">
                  
                  {/* Category Fast Filters Pillbox */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-stone-200 mb-6 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-stone-900 text-stone-50 font-bold'
                          : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      🌿 All Products
                    </button>
                    {[
                      { id: 'indoor', title: '🏡 Indoor' },
                      { id: 'outdoor', title: '🌳 Outdoor' },
                      { id: 'succulents', title: '🌵 Succulents & Cacti' },
                      { id: 'herbs', title: '🥗 Herbs & Seeds' },
                      { id: 'pots-soil', title: '🪴 Pots & Soil' },
                      { id: 'care-tools', title: '✂️ Care Tools' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-emerald-800 text-stone-50 font-bold'
                            : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-850/20'
                        }`}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>

                  {/* Search and Filters Header */}
                  <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                      
                      {/* Search Bar Input */}
                      <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Search: 'Monstera', 'Pet-friendly', 'Verdant Valley'..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-emerald-800"
                        />
                      </div>

                      {/* Advanced Filter triggers */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-xs text-stone-500 font-medium">
                          Showing {filteredProducts.length} items
                        </span>
                        
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            showFilters || selectedNurseryFilter !== 'all' || selectedLight !== 'all' || selectedWater !== 'all' || selectedDifficulty !== 'all'
                              ? 'border-emerald-800 bg-emerald-50 text-emerald-800'
                              : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Care Filters</span>
                        </button>
                      </div>

                    </div>

                    {/* Collapsible Advanced Filters Drawer */}
                    {showFilters && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-stone-100 animate-fade-in text-xs">
                        
                        {/* Nursery Growers */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Nursery Farm</label>
                          <select
                            value={selectedNurseryFilter}
                            onChange={(e) => setSelectedNurseryFilter(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 bg-stone-50 focus:outline-emerald-850"
                          >
                            <option value="all">All Nurseries</option>
                            <option value="n1">Verdant Valley Nursery</option>
                            <option value="n2">Sands & Spines Botanicals</option>
                            <option value="n3">The Heirlooms Guild</option>
                          </select>
                        </div>

                        {/* Sunlight */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Sunlight Need</label>
                          <select
                            value={selectedLight}
                            onChange={(e) => setSelectedLight(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 bg-stone-50 focus:outline-emerald-850"
                          >
                            <option value="all">Any Light</option>
                            <option value="low">Low Light</option>
                            <option value="indirect">Bright Indirect</option>
                            <option value="direct">Direct Sun</option>
                          </select>
                        </div>

                        {/* Water requirements */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Watering Style</label>
                          <select
                            value={selectedWater}
                            onChange={(e) => setSelectedWater(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 bg-stone-50 focus:outline-emerald-850"
                          >
                            <option value="all">Any Watering</option>
                            <option value="low">Low Need (Succulent style)</option>
                            <option value="moderate">Moderate Need (Top-dry)</option>
                            <option value="high">High Constant</option>
                          </select>
                        </div>

                        {/* Care difficulty */}
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Care Difficulty</label>
                          <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg p-2 bg-stone-50 focus:outline-emerald-850"
                          >
                            <option value="all">Any Difficulty</option>
                            <option value="easy">Easy (Forgiving)</option>
                            <option value="medium">Medium Care</option>
                            <option value="hard">Expert Only (Demanding)</option>
                          </select>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Main Product Grid */}
                  {filteredProducts.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl border-2 border-dashed border-stone-200 bg-white">
                      <span className="text-3xl">🥀</span>
                      <h3 className="font-extrabold text-sm text-stone-800 mt-2">No Plants Match Your Filters</h3>
                      <p className="text-stone-400 text-xs mt-1">Try resetting care filters or searching a different term.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedNurseryFilter('all');
                          setSelectedLight('all');
                          setSelectedWater('all');
                          setSelectedDifficulty('all');
                        }}
                        className="mt-4 bg-emerald-800 hover:bg-emerald-900 text-stone-50 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((prod) => (
                        <ProductCard
                          key={prod.id}
                          product={prod}
                          onSelect={setSelectedProduct}
                          onAddToCart={handleAddToCart}
                          isAiMatch={aiMatchProfile?.recommendedCategories.includes(prod.category)}
                        />
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. AI DOCTOR TAB */}
        {activeTab === 'doctor' && (
          <AIDoctor
            products={products}
            onAddToCart={handleAddToCart}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setActiveTab('browse');
            }}
          />
        )}

        {/* 3. AI FINDER / MATCHMAKER QUIZ TAB */}
        {activeTab === 'finder' && (
          <AIMatchmaker
            products={products}
            onAddToCart={handleAddToCart}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setActiveTab('browse');
            }}
          />
        )}

        {/* 4. SELLER NURSERY PORTAL */}
        {activeTab === 'nursery' && (
          <NurseryPortal
            products={products}
            onAddProduct={handleProductAdded}
          />
        )}

        {/* 5. USER SIMULATED ORDERS & SHIPMENT TRACKER */}
        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-black text-stone-900 mb-1 tracking-tight">Your Botanical Order History</h2>
            <p className="text-stone-500 text-xs sm:text-sm mb-8">
              Review, track, and simulate live transit stages of organic plants shipped direct-from-farm.
            </p>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center py-16 shadow-xs">
                <span className="text-3xl block mb-2">📦</span>
                <h3 className="font-extrabold text-sm text-stone-800 mb-1">No Orders Processed Yet</h3>
                <p className="text-stone-400 text-xs max-w-xs mx-auto mb-4">
                  Add premium specimens to your gardening cart and complete checkout to simulate botanical cargo shipping.
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="bg-emerald-800 text-stone-50 text-xs font-bold py-2 px-5 rounded-xl cursor-pointer hover:bg-emerald-900 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => {
                  // Determine dynamic state for progress timeline
                  const isShipped = ord.status === 'Shipped' || ord.status === 'Delivered';
                  const isDelivered = ord.status === 'Delivered';
                  const progressWidth = isDelivered ? '100%' : isShipped ? '50%' : '15%';

                  return (
                    <div key={ord.id} className="bg-white rounded-3xl border border-stone-250 overflow-hidden shadow-xs hover:shadow-md transition-all">
                      
                      {/* Order Metadata bar */}
                      <div className="bg-stone-50 border-b border-stone-200 p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                        <div className="grid grid-cols-2 sm:flex sm:gap-8 gap-4 flex-1">
                          <div>
                            <span className="text-[10px] text-stone-400 font-extrabold uppercase block tracking-wider">Order ID</span>
                            <span className="font-mono font-bold text-stone-900">{ord.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 font-extrabold uppercase block tracking-wider">Date Placed</span>
                            <span className="font-semibold text-stone-700">{ord.date}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 font-extrabold uppercase block tracking-wider">Total</span>
                            <span className="font-black text-stone-900">{formatINR(ord.total)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 font-extrabold uppercase block tracking-wider">Nursery Vendor</span>
                            <span className="font-bold text-emerald-800 text-[10px] uppercase">Verified Growers</span>
                          </div>
                        </div>

                        {/* ADVANCE SIMULATOR BUTTON */}
                        <button
                          onClick={() => handleAdvanceOrderStatus(ord.id)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-[10px] px-3.5 py-2 rounded-lg cursor-pointer transition-colors shrink-0 text-center uppercase tracking-wider"
                          title="Click to simulate next delivery transit status"
                        >
                          🚀 Next Transit Step
                        </button>
                      </div>

                      {/* Progress tracking status indicator */}
                      <div className="p-5 border-b border-stone-150 bg-stone-50/20">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-stone-600">Simulated Transit Progress</span>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : ord.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            🛡️ {ord.status === 'Processing' ? 'Roots Securely Packed' : ord.status === 'Shipped' ? 'In Transit via Cargo Air' : 'Delivered & Acclimatized'}
                          </span>
                        </div>
                        
                        {/* Interactive shipment timeline progress bar */}
                        <div className="relative mt-6 mb-2 max-w-xl mx-auto">
                          {/* Background Track Line */}
                          <div className="absolute top-2.5 left-0 right-0 h-1 bg-stone-200 rounded-full z-0" />
                          
                          {/* Animated Progress Track Line */}
                          <div 
                            className="absolute top-2.5 left-0 h-1 bg-emerald-600 rounded-full z-0 transition-all duration-700 ease-out"
                            style={{ width: progressWidth }}
                          />
                          
                          {/* Milestone Steps */}
                          <div className="relative z-10 flex justify-between text-[10px]">
                            {/* Step 1: Packed */}
                            <div className="flex flex-col items-center">
                              <span className="w-6 h-6 bg-emerald-600 text-white font-extrabold rounded-full flex items-center justify-center text-[10px] shadow-sm">
                                ✓
                              </span>
                              <span className="font-bold text-stone-800 mt-1.5">Roots Packed</span>
                              <span className="text-[9px] text-stone-400">Greenhouse Pod</span>
                            </div>

                            {/* Step 2: Shipped */}
                            <div className="flex flex-col items-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm transition-all duration-300 ${
                                isShipped ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-stone-300 text-stone-400'
                              }`}>
                                {isShipped ? '✓' : '2'}
                              </span>
                              <span className={`font-bold mt-1.5 ${isShipped ? 'text-stone-850' : 'text-stone-400'}`}>In Transit</span>
                              <span className="text-[9px] text-stone-400">Himalayan Cargo</span>
                            </div>

                            {/* Step 3: Delivered */}
                            <div className="flex flex-col items-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm transition-all duration-300 ${
                                isDelivered ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-stone-300 text-stone-400'
                              }`}>
                                {isDelivered ? '✓' : '3'}
                              </span>
                              <span className={`font-bold mt-1.5 ${isDelivered ? 'text-stone-850' : 'text-stone-400'}`}>Delivered</span>
                              <span className="text-[9px] text-stone-400">Happy Foliage</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order items lists */}
                      <div className="p-5 divide-y divide-stone-100 bg-white">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex gap-4 items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-stone-50 shrink-0 shadow-xs"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-extrabold text-sm text-stone-900 leading-tight">{item.name}</h4>
                                <p className="text-[10px] text-stone-400 mt-0.5">Cultivated by {item.nurseryName} Greenhouse</p>
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <span className="text-stone-500 font-semibold block">Quantity: {item.quantity}</span>
                              <span className="font-bold text-stone-900 mt-0.5 block">{formatINR(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping destination */}
                      <div className="bg-stone-50 border-t border-stone-150 px-5 py-4 text-xs text-stone-500 flex justify-between items-center flex-wrap gap-2">
                        <span>
                          📦 Destination: <strong className="text-stone-800 font-bold">{ord.shippingAddress}</strong>
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                          🛡️ 100% Acclimatized Healthy Root Guarantee
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. FULL PAGE SECURE AMAZON-STYLE CHECKOUT GATEWAY */}
        {activeTab === 'checkout' && (
          <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            {/* Secure Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-stone-200 pb-5 mb-8 gap-4 bg-white p-5 rounded-2xl shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg text-stone-950">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
                    Amazon Secure 256-Bit Escrow Checkout
                  </h1>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                    Indian Horticultural Gateway Hub
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-stone-500 font-medium">
                  Signing in as <strong className="text-stone-800">Amit Sharma</strong>
                </span>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  ◀ Continue Shopping
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-xl mx-auto">
                <span className="text-4xl block mb-3">🛒</span>
                <h3 className="font-extrabold text-sm text-stone-800 mb-1">Your Botanical Cart is Empty</h3>
                <p className="text-stone-400 text-xs mb-6">
                  You don't have any green friends added for checkout. Explore our certified grower network.
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="bg-emerald-800 text-stone-50 text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer hover:bg-emerald-900 transition-colors"
                >
                  Explore Plants
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Side: 3-Step Checkout Details */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* STEP 1: Delivery Address */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center text-xs">
                        1
                      </span>
                      <h3 className="text-base font-black text-stone-900 uppercase tracking-tight">
                        Select a Shipping Destination
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {/* Address Preset 1 */}
                      <label 
                        className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          shippingAddress === 'Amit Sharma, 14/2 Park Street, Flat 4B, Kolkata, West Bengal - 700016'
                            ? 'border-emerald-800 bg-emerald-50/25'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                        onClick={() => setShippingAddress('Amit Sharma, 14/2 Park Street, Flat 4B, Kolkata, West Bengal - 700016')}
                      >
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            name="checkout_addr" 
                            className="mt-1 text-emerald-800 accent-emerald-800 shrink-0"
                            checked={shippingAddress === 'Amit Sharma, 14/2 Park Street, Flat 4B, Kolkata, West Bengal - 700016'}
                            readOnly
                          />
                          <div className="text-xs">
                            <span className="font-extrabold text-stone-900 block">Amit Sharma (Kolkata Hub)</span>
                            <span className="text-stone-500 leading-relaxed block mt-0.5">
                              14/2 Park Street, Flat 4B, Kolkata, West Bengal - 700016
                            </span>
                            <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                              🌿 Local nursery air-transits support Kolkata region
                            </span>
                          </div>
                        </div>
                      </label>

                      {/* Address Preset 2 */}
                      <label 
                        className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          shippingAddress === 'Amit Sharma, 102 Green Meadows, Sector 5, Bengaluru, Karnataka - 560103'
                            ? 'border-emerald-800 bg-emerald-50/25'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                        onClick={() => setShippingAddress('Amit Sharma, 102 Green Meadows, Sector 5, Bengaluru, Karnataka - 560103')}
                      >
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            name="checkout_addr" 
                            className="mt-1 text-emerald-800 accent-emerald-800 shrink-0"
                            checked={shippingAddress === 'Amit Sharma, 102 Green Meadows, Sector 5, Bengaluru, Karnataka - 560103'}
                            readOnly
                          />
                          <div className="text-xs">
                            <span className="font-extrabold text-stone-900 block">Amit Sharma (Bengaluru Greenhouse Hub)</span>
                            <span className="text-stone-500 leading-relaxed block mt-0.5">
                              102 Green Meadows, Sector 5, HSR Layout, Bengaluru, Karnataka - 560103
                            </span>
                            <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                              🚀 Next-Day Express available from local South India farms
                            </span>
                          </div>
                        </div>
                      </label>

                      {/* Custom Address Option */}
                      <div className="pt-2">
                        <span className="block text-[10px] font-extrabold uppercase text-stone-400 mb-1.5 tracking-wider">
                          Or Enter Custom Shipping Address
                        </span>
                        <textarea
                          placeholder="Type recipient name, street address, flat, city, state and pincode..."
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="w-full border border-stone-300 rounded-2xl p-3.5 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-hidden bg-white min-h-[70px] leading-relaxed placeholder-stone-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: Greenhouse Delivery Speed */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center text-xs">
                        2
                      </span>
                      <h3 className="text-base font-black text-stone-900 uppercase tracking-tight">
                        Choose protective transit speed
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Ground speed */}
                      <button
                        onClick={() => setShippingType('ground')}
                        className={`p-4 text-[11px] text-left border-2 rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                          shippingType === 'ground'
                            ? 'border-emerald-800 bg-emerald-50/10'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                            🌿 Standard Protected Cargo
                          </p>
                          <p className="text-stone-500 font-semibold mt-1 leading-relaxed">
                            Secured root pod container dispatched via standard Indian cargo delivery.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-stone-100 w-full flex justify-between items-center text-[10px]">
                          <span className="text-stone-400 font-bold uppercase">Estimated 3-5 days</span>
                          <span className="font-black text-stone-800 text-xs">
                            {cartSubtotal > 499 ? 'FREE Delivery' : '₹49 Delivery'}
                          </span>
                        </div>
                      </button>

                      {/* Air speed */}
                      <button
                        onClick={() => setShippingType('heatpack')}
                        className={`p-4 text-[11px] text-left border-2 rounded-2xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          shippingType === 'heatpack'
                            ? 'border-emerald-800 bg-emerald-50/10'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                        }`}
                      >
                        {isPrimeDeliverable && (
                          <span className="absolute top-0 right-0 bg-[#FF9900] text-stone-950 font-black text-[8px] uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                            Prime Eligible
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                            🚀 Express Air Delivery
                          </p>
                          <p className="text-stone-500 font-semibold mt-1 leading-relaxed">
                            Ultra-fast greenhouse transits. Safe root temperature guaranteed with specialized packaging.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-stone-100 w-full flex justify-between items-center text-[10px]">
                          <span className="text-stone-400 font-bold uppercase">Estimated Next Day</span>
                          <span className="font-black text-stone-850 text-xs">
                            {isPrimeDeliverable ? (
                              <span className="text-green-800 font-bold">FREE with Prime</span>
                            ) : (
                              '₹99 Delivery'
                            )}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* STEP 3: Secure Payment Gateways */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-extrabold flex items-center justify-center text-xs">
                        3
                      </span>
                      <h3 className="text-base font-black text-stone-900 uppercase tracking-tight">
                        Select Secure Payment Mode
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('upi');
                          setShowQrCode(false);
                        }}
                        className={`py-3 text-xs font-extrabold rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50/10 text-blue-800 shadow-xs' : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span>UPI / BHIM QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('cod');
                          setShowQrCode(false);
                        }}
                        className={`py-3 text-xs font-extrabold rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'cod' ? 'border-emerald-700 bg-emerald-50/10 text-emerald-800 shadow-xs' : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300'
                        }`}
                      >
                        <Truck className="w-4 h-4 text-emerald-700" />
                        <span>Pay on Delivery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('card');
                          setShowQrCode(false);
                        }}
                        className={`py-3 text-xs font-extrabold rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/10 text-indigo-700 shadow-xs' : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-indigo-650" />
                        <span>Credit / Debit Card</span>
                      </button>
                    </div>

                    {/* Payment Mode UI Details */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5">
                      {paymentMethod === 'upi' && (
                        <div className="space-y-4">
                          <div>
                            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-1">
                              Instant UPI Escrow Verification
                            </span>
                            <p className="text-xs text-stone-500 leading-relaxed">
                              Enter your UPI ID (e.g., <code>amit@okaxis</code>) to generate a dynamic, secure transaction QR Code.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter UPI ID (e.g., recipient@ybl)"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-xs bg-white font-mono placeholder:font-sans focus:outline-emerald-850"
                            />
                            <button
                              type="button"
                              disabled={!upiId.includes('@')}
                              onClick={() => {
                                setShowQrCode(true);
                                setQrCodeTimer(180);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white font-extrabold text-xs px-4 rounded-xl transition-colors cursor-pointer"
                            >
                              Get QR Code
                            </button>
                          </div>
                          
                          {showQrCode && (
                            <div className="bg-white border border-blue-100 rounded-2xl p-4 text-center flex flex-col items-center max-w-sm mx-auto shadow-xs animate-fade-in">
                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-2">
                                <QrCode className="w-28 h-28 text-slate-800 animate-pulse" />
                              </div>
                              <p className="text-xs font-black text-blue-800">
                                Scan & Pay: {formatINR(calculateCartTotal())}
                              </p>
                              <p className="text-[10px] text-stone-400 mt-1">UPI Handle: {upiId}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-red-600 font-extrabold mt-3 bg-red-50 px-3 py-1 rounded-full">
                                <Clock className="w-3.5 h-3.5 animate-pulse" />
                                <span>Expires in {Math.floor(qrCodeTimer / 60)}:{(qrCodeTimer % 60).toString().padStart(2, '0')}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowQrCode(false);
                                  handleCheckout(new Event('submit') as any);
                                }}
                                className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Check className="w-4 h-4" />
                                <span>Simulate Secure UPI App Transfer Success</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {paymentMethod === 'cod' && (
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-emerald-800 mt-0.5 shrink-0" />
                          <div className="text-xs leading-relaxed">
                            <span className="font-extrabold text-stone-900 block">Pay Hand-To-Hand at Gate</span>
                            <span className="text-stone-500 block mt-0.5">
                              No payment needed today! You can pay cash or scan the courier's delivery handheld machine upon receiving the plant-pot at your doorstep.
                            </span>
                            <p className="text-stone-700 font-bold mt-1.5">
                              Please prepare exact change of <strong className="text-emerald-900 font-extrabold">{formatINR(calculateCartTotal())}</strong>.
                            </p>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="space-y-3 max-w-md">
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                            Credit / Debit card payment
                          </span>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="Card Number (e.g. 4321 •••• •••• 9876)"
                              className="col-span-2 border border-stone-300 rounded-xl px-3 py-2 bg-white font-mono focus:outline-emerald-850"
                            />
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="MM/YY"
                              className="border border-stone-300 rounded-xl px-3 py-2 bg-white font-mono focus:outline-emerald-850"
                            />
                            <input
                              type="password"
                              maxLength={3}
                              placeholder="CVV"
                              className="border border-stone-300 rounded-xl px-3 py-2 bg-white font-mono focus:outline-emerald-850"
                            />
                          </div>
                          <p className="text-[10px] text-stone-400">
                            🔒 Fully secure SSL encrypted. Supporting RuPay, Visa, MasterCard, and Amex.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STEP 4: Review Garden Items */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
                    <h3 className="text-sm font-black text-stone-800 uppercase tracking-tight mb-4">
                      Review Items in Shipment ({cart.length})
                    </h3>
                    <div className="divide-y divide-stone-150">
                      {cart.map((item) => (
                        <div key={item.product.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div className="flex gap-4 items-center">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-stone-200 bg-stone-50 shrink-0 shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="font-extrabold text-sm text-stone-900 leading-tight">
                                {item.product.name}
                              </h4>
                              <p className="text-[10px] text-stone-400 mt-0.5">
                                Specimen cultivated by {item.product.nurseryName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                  Qty: {item.quantity}
                                </span>
                                {item.product.isPrime && (
                                  <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 font-extrabold px-2 py-0.5 rounded-full">
                                    ✓ Prime
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs">
                            <span className="font-extrabold text-stone-900 block">
                              {formatINR(item.product.price * item.quantity)}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              ({formatINR(item.product.price)} each)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Order Summary Side Panel */}
                <div className="space-y-6">
                  
                  {/* Summary Box */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-md sticky top-24">
                    <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest border-b border-stone-150 pb-3 mb-4">
                      Order Summary
                    </h3>

                    {/* Promo Discount Box on Checkout */}
                    <div className="mb-4">
                      <span className="block text-[10px] font-extrabold uppercase text-stone-400 mb-1.5 tracking-wider">
                        Have a coupon / promo code?
                      </span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Code: SPRINGSPROUT"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs bg-white uppercase font-bold focus:outline-emerald-850 placeholder-stone-400"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="bg-stone-900 hover:bg-stone-800 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer uppercase"
                        >
                          Apply
                        </button>
                      </div>
                      {promoMessage && (
                        <p className={`text-[10px] font-extrabold mt-1.5 ${appliedDiscount > 0 ? 'text-emerald-800' : 'text-red-600'}`}>
                          {promoMessage}
                        </p>
                      )}
                    </div>

                    {/* Breakdown details */}
                    <div className="space-y-2 text-xs border-b border-stone-150 pb-4 mb-4">
                      <div className="flex justify-between text-stone-500 font-semibold">
                        <span>Items Subtotal</span>
                        <span>{formatINR(cartSubtotal)}</span>
                      </div>
                      
                      {appliedDiscount > 0 && (
                        <div className="flex justify-between text-emerald-800 font-black">
                          <span>Promotion Applied ({appliedDiscount * 100}%)</span>
                          <span>-{formatINR(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-stone-500 font-semibold">
                        <span>Protective Plant-Pod Cargo Fee</span>
                        <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <span className="text-xs font-black text-stone-900 uppercase tracking-wider block">
                          Grand Total (INR)
                        </span>
                        <span className="text-[9px] text-stone-400 font-medium">
                          Incl. all organic taxes & farm duties
                        </span>
                      </div>
                      <span className="text-2xl font-black text-stone-900">
                        {formatINR(calculateCartTotal())}
                      </span>
                    </div>

                    {/* Submit Form */}
                    <form onSubmit={handleCheckout} className="space-y-3">
                      <button
                        type="submit"
                        disabled={checkingOut || !shippingAddress.trim() || (paymentMethod === 'upi' && !showQrCode && upiId.includes('@'))}
                        className="w-full bg-[#f0c14b] hover:bg-[#ddb347] border border-[#a88734] text-stone-950 font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer text-center shadow-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        {checkingOut ? (
                          <>
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            <span>Processing Escrow Gateway...</span>
                          </>
                        ) : (
                          <span>
                            {paymentMethod === 'upi' ? 'Pay & Secure Order via UPI' : 'Simulate Secure Placement'}
                          </span>
                        )}
                      </button>
                    </form>

                    {/* Trust assurances */}
                    <div className="mt-5 pt-4 border-t border-stone-150 space-y-3 text-[10px] text-stone-400 font-medium leading-relaxed">
                      <div className="flex gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>100% Acclimatized Healthy Root Guarantee</strong>. If your plant arrives damaged or dies within 14 days, we dispatch a fresh farm replacement.
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          SSL encrypted simulated gateway escrow. Funds are only released to the nursery growers once transit delivers successfully.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo & Cert */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span className="font-black text-stone-100 text-sm">SproutMarket</span>
            </div>
            <p className="text-[11px] leading-relaxed max-w-xs text-stone-400">
              The premier certified nursery network connecting plant lovers with direct-from-farm glasshouse organic specimens. Secure, breathable shipping pods.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-stone-100">Marketplace Core Features</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => { setSelectedProduct(null); setActiveTab('browse'); }} className="hover:text-stone-100 text-left cursor-pointer">Browse Plant Catalog</button></li>
              <li><button onClick={() => { setSelectedProduct(null); setActiveTab('doctor'); }} className="hover:text-stone-100 text-left cursor-pointer">AI Master Plant Diagnosis</button></li>
              <li><button onClick={() => { setSelectedProduct(null); setActiveTab('finder'); }} className="hover:text-stone-100 text-left cursor-pointer">Matchmaker suitability Quiz</button></li>
              <li><button onClick={() => { setSelectedProduct(null); setActiveTab('nursery'); }} className="hover:text-stone-100 text-left cursor-pointer">Grower/Nursery Dashboard</button></li>
            </ul>
          </div>

          {/* Guidelines info */}
          <div>
            <h4 className="font-bold text-xs text-stone-100 mb-2.5">Nursery Guarantees</h4>
            <p className="text-[11px] leading-relaxed mb-3">
              We certify that every listing matches active nursery standards. Backed by organic fertilization, acclimated foliage, and instant AI specialist support.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1 rounded-full text-[10px] font-bold">
              <span>🛡️</span>
              <span>100% Acclimatized Healthy Root Guarantee</span>
            </div>
          </div>

        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-stone-800 mt-8 pt-6 text-center text-[10px] text-stone-500 font-medium">
          © 2026 SproutMarket Marketplace Inc. All rights reserved. Simulating direct greenhouse parcel distribution.
        </div>
      </footer>

      {/* SHOPPING CART DRAWER MODAL OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between h-full animate-slide-in">
              
              {/* Header */}
              <div className="px-5 py-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-base text-stone-900">Your Gardening Cart</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Item list */}
              <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-stone-100">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 text-stone-400 text-xs">
                    <span className="text-3xl block mb-2">🛒</span>
                    <p className="font-bold text-stone-700 mb-1">Your cart is empty</p>
                    <p className="max-w-[200px] mx-auto text-[11px] text-stone-400 leading-relaxed">
                      Select healthy house plants, heirloom seeds, or care supplies to begin your grow farm.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-4 flex items-start gap-4">
                      {/* Image */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-150 bg-stone-50 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      {/* Description & Qty */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-xs text-stone-900 leading-tight line-clamp-2">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-emerald-800 uppercase font-semibold">
                              {item.product.nurseryName}
                            </span>
                          </div>
                          <span className="font-bold text-xs text-stone-950">
                            {formatINR(item.product.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3.5 pt-1.5 border-t border-stone-50">
                          {/* Qty Modifier */}
                          <div className="flex items-center border border-stone-250 rounded-lg overflow-hidden bg-stone-50 scale-90">
                            <button
                              onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 text-stone-800 font-semibold text-xs">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                              className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="text-[10px] text-stone-400 hover:text-red-600 font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout billing summary */}
              {cart.length > 0 && (
                <div className="bg-stone-50 border-t border-stone-200 p-5 shadow-inner">
                  
                  {/* Shipping type selector */}
                  <div className="mb-4">
                    <label className="block text-[9px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                      Greenhouse Delivery Speed
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShippingType('ground')}
                        className={`p-2.5 text-[10px] font-bold rounded-xl text-left border-2 transition-all cursor-pointer ${
                          shippingType === 'ground'
                            ? 'border-emerald-800 bg-white shadow-xs'
                            : 'border-stone-250 hover:border-stone-300 bg-stone-100'
                        }`}
                      >
                        <p className="text-stone-900 leading-none">🌿 Standard Cargo</p>
                        <p className="text-[9px] text-stone-500 font-medium mt-1">
                          {cartSubtotal > 499 ? 'FREE Delivery' : '₹49 Delivery'}
                        </p>
                        <span className="text-[8px] text-stone-400 font-medium">Est: 3-5 days</span>
                      </button>
                      
                      <button
                        onClick={() => setShippingType('heatpack')}
                        className={`p-2.5 text-[10px] font-bold rounded-xl text-left border-2 transition-all cursor-pointer relative overflow-hidden ${
                          shippingType === 'heatpack'
                            ? 'border-emerald-800 bg-white shadow-xs'
                            : 'border-stone-250 hover:border-stone-300 bg-stone-100'
                        }`}
                      >
                        <p className="text-stone-900 leading-none">🚀 Express Air</p>
                        <p className="text-[9px] text-stone-500 font-medium mt-1">
                          {isPrimeDeliverable ? (
                            <span className="text-green-700 font-bold">FREE with Prime</span>
                          ) : (
                            '₹99 Delivery'
                          )}
                        </p>
                        <span className="text-[8px] text-stone-400 font-medium block">Est: Next Day</span>
                      </button>
                    </div>
                  </div>

                  {/* Promo Input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Promo: 'SPRINGSPROUT' (15%)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 border border-stone-300 rounded-lg px-3 py-1.5 text-xs bg-white uppercase placeholder-stone-400"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="bg-stone-900 hover:bg-stone-850 text-stone-50 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-[10px] font-bold mb-4 ${appliedDiscount > 0 ? 'text-emerald-800' : 'text-red-600'}`}>
                      {promoMessage}
                    </p>
                  )}

                  {/* Pricing Rows */}
                  <div className="space-y-1 text-xs border-b border-stone-200 pb-3 mb-4">
                    <div className="flex justify-between text-stone-500 font-semibold">
                      <span>Nursery Subtotal</span>
                      <span>{formatINR(cartSubtotal)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-800 font-bold">
                        <span>Festival Discount</span>
                        <span>-{formatINR(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-500 font-semibold">
                      <span>Certified Protective Plant-Pod Transit</span>
                      <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm font-black text-stone-900 uppercase">Estimated Total</span>
                    <span className="text-xl font-black text-stone-900">{formatINR(calculateCartTotal())}</span>
                  </div>

                  {/* Interactive Indian Payment Section */}
                  <div className="border border-stone-200 bg-stone-100 rounded-xl p-3.5 mb-4">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                      Secure Payment Mode (India Hub)
                    </span>
                    
                    <div className="grid grid-cols-3 gap-1.5 mb-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('upi');
                          setShowQrCode(false);
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'upi' ? 'border-blue-600 bg-white text-blue-700 shadow-xs' : 'border-stone-250 bg-stone-50 text-stone-600'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('cod');
                          setShowQrCode(false);
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'cod' ? 'border-emerald-700 bg-white text-emerald-800 shadow-xs' : 'border-stone-250 bg-stone-50 text-stone-600'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Pay on Del</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMethod('card');
                          setShowQrCode(false);
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          paymentMethod === 'card' ? 'border-indigo-600 bg-white text-indigo-700 shadow-xs' : 'border-stone-250 bg-stone-50 text-stone-600'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card</span>
                      </button>
                    </div>

                    {/* UPI UI */}
                    {paymentMethod === 'upi' && (
                      <div className="space-y-2.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter UPI ID (e.g., vpa@okaxis)"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono placeholder:font-sans"
                          />
                          <button
                            type="button"
                            disabled={!upiId.includes('@')}
                            onClick={() => {
                              setShowQrCode(true);
                              setQrCodeTimer(180);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white font-bold text-xs px-3 rounded-lg transition-colors cursor-pointer"
                          >
                            Get QR
                          </button>
                        </div>
                        
                        {showQrCode && (
                          <div className="bg-white border border-blue-100 rounded-lg p-3 text-center flex flex-col items-center animate-fade-in">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                              <QrCode className="w-24 h-24 text-slate-800" />
                            </div>
                            <p className="text-[10px] font-extrabold text-blue-700">Scan to Pay: {formatINR(calculateCartTotal())}</p>
                            <p className="text-[9px] text-stone-400 mt-0.5">UPI ID: {upiId}</p>
                            <div className="flex items-center gap-1 text-[9px] text-red-600 font-bold mt-2 bg-red-50 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3 animate-pulse" />
                              <span>Expires in {Math.floor(qrCodeTimer / 60)}:{(qrCodeTimer % 60).toString().padStart(2, '0')}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // Simulate scan success
                                setShowQrCode(false);
                                handleCheckout(new Event('submit') as any);
                              }}
                              className="mt-3 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Simulate Payment Scan Success</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cash on Delivery UI */}
                    {paymentMethod === 'cod' && (
                      <p className="text-[10px] text-stone-500 font-medium leading-relaxed">
                        👍 **Cash/UPI on Delivery Selected**. Pay hand-to-hand at your gate. Please keep exact change of <strong className="text-slate-900">{formatINR(calculateCartTotal())}</strong> ready.
                      </p>
                    )}

                    {/* Card UI */}
                    {paymentMethod === 'card' && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="Card Number"
                          className="col-span-2 border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                        />
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          className="border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                        />
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="CVV"
                          className="border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Checkout Address & Submit */}
                  <form onSubmit={handleCheckout} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Shipping Address (e.g., 12, Park Street, Kolkata)"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg p-2.5 text-xs focus:outline-emerald-800 bg-white"
                    />
                    
                    <button
                      id="simulated-checkout-btn"
                      type="submit"
                      disabled={checkingOut || !shippingAddress.trim() || (paymentMethod === 'upi' && !showQrCode && upiId.includes('@'))}
                      className="w-full bg-[#f08804] hover:bg-[#df7d03] text-stone-950 font-extrabold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {checkingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing Indian Banking Gateway Escrow...</span>
                        </>
                      ) : (
                        <span>
                          {paymentMethod === 'upi' ? 'Pay Now via UPI' : 'Simulate Secure Order Placement'}
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Global Indian Pincode Chooser Modal (Amazon Style) */}
      {isPincodeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 overflow-hidden shadow-2xl animate-scale-up">
            <div className="bg-[#131921] px-5 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">Choose your delivery location</h3>
              </div>
              <button 
                onClick={() => setIsPincodeModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-xs text-stone-500 leading-relaxed">
                Enter your pincode to see product availability and delivery speeds for the Great Indian Plant Festival.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                const info = lookupPincode(pincodeInput);
                if (info) {
                  setPincodeModalError('');
                  setPincode(pincodeInput);
                  setPincodeCity(`${info.city}, ${info.state}`);
                  localStorage.setItem('india_pincode', pincodeInput);
                  localStorage.setItem('india_pincode_city', `${info.city}, ${info.state}`);
                  setIsPincodeModalOpen(false);
                } else {
                  setPincodeModalError('Please enter a valid 6-digit Indian PIN (e.g. 110001, 400001, 560001)');
                }
              }} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Indian PIN code"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 border border-stone-300 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-emerald-800 font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-[#f08804] hover:bg-[#df7d03] text-stone-950 font-bold text-xs px-6 rounded-xl cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {pincodeModalError && (
                  <p className="text-red-600 text-[11px] font-medium leading-none">{pincodeModalError}</p>
                )}
              </form>

              <div className="border-t border-stone-150 pt-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                  Popular Indian Hubs (1-Day Express active)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { pin: '400001', label: 'Mumbai, Maharashtra' },
                    { pin: '110001', label: 'New Delhi, Delhi' },
                    { pin: '560001', label: 'Bengaluru, Karnataka' },
                    { pin: '500001', label: 'Hyderabad, Telangana' },
                    { pin: '600001', label: 'Chennai, Tamil Nadu' },
                    { pin: '700001', label: 'Kolkata, West Bengal (Standard)' }
                  ].map((cityItem) => (
                    <button
                      key={cityItem.pin}
                      type="button"
                      onClick={() => {
                        setPincode(cityItem.pin);
                        setPincodeCity(cityItem.label);
                        localStorage.setItem('india_pincode', cityItem.pin);
                        localStorage.setItem('india_pincode_city', cityItem.label);
                        setIsPincodeModalOpen(false);
                      }}
                      className="text-left py-2 px-3 border border-stone-200 rounded-xl hover:border-emerald-800 hover:bg-emerald-50/10 cursor-pointer transition-all"
                    >
                      <strong className="block text-stone-800">{cityItem.pin}</strong>
                      <span className="text-[10px] text-stone-400 truncate block">{cityItem.label.split(',')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
