import { useState } from 'react';
import { Product, Nursery } from '../types';
import { initialNurseries } from '../data';
import { ShoppingBag, Landmark, PlusCircle, Check, Loader2, Sparkles } from 'lucide-react';

interface NurseryPortalProps {
  products: Product[];
  onAddProduct: (newProd: Product) => void;
}

export default function NurseryPortal({ products, onAddProduct }: NurseryPortalProps) {
  const [selectedNursery, setSelectedNursery] = useState<Nursery>(initialNurseries[0]);
  
  // New product form states
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'indoor' | 'outdoor' | 'succulents' | 'herbs' | 'pots-soil' | 'care-tools'>('indoor');
  const [stock, setStock] = useState('20');
  const [light, setLight] = useState<'low' | 'indirect' | 'direct'>('indirect');
  const [water, setWater] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [size, setSize] = useState('Medium (6" grower pot)');
  const [imageUrl, setImageUrl] = useState('');
  
  // Custom states
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Filter listings belonging to active nursery
  const nurseryProducts = products.filter(p => p.nurseryId === selectedNursery.id);

  // Pre-made premium Unsplash botanical pictures to auto-populate the listing for quick testing!
  const PRESET_PLANT_PHOTOS = [
    { title: 'Ficus Rubber Tree', url: 'https://images.unsplash.com/photo-1597055181300-e3633a207518?auto=format&fit=crop&q=80&w=600&h=600' },
    { title: 'Aloe Vera Planter', url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=600&h=600' },
    { title: 'Calathea Peacock', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600&h=600' },
  ];

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSubmitting(true);
    setSuccess(false);

    const defaultImg = imageUrl || 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600&h=600';

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          scientificName: scientificName || 'Botanical Cultivar',
          description: description || 'Grown with organic practices in deep nursery beds.',
          price: Number(price) || 19.99,
          category,
          image: defaultImg,
          nurseryId: selectedNursery.id,
          nurseryName: selectedNursery.name,
          stock: Number(stock) || 15,
          light,
          water,
          difficulty,
          features: ['Nursery Favorite', 'Fresh Cut', 'Acclimated'],
          size
        })
      });

      if (response.ok) {
        const addedProduct = await response.json();
        onAddProduct(addedProduct);
        setSuccess(true);
        // Clear form
        setName('');
        setScientificName('');
        setDescription('');
        setPrice('');
        setImageUrl('');
        
        // auto dismiss banner
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error creating product listing:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="nursery-portal-view" className="max-w-6xl mx-auto px-4 py-8 text-brand-text">
      {/* Selector banner */}
      <div className="bg-brand-muted border border-brand-border rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
            Select Your Active Grow Farm
          </span>
          <h2 className="text-xl font-serif font-bold text-brand-primary mt-1">Vendor Portal & Sprout Exchange</h2>
        </div>

        <div className="flex gap-2.5">
          {initialNurseries.map((nur) => (
            <button
              key={nur.id}
              onClick={() => setSelectedNursery(nur)}
              className={`px-4.5 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                selectedNursery.id === nur.id
                  ? 'bg-brand-primary border-brand-primary text-white shadow-xs'
                  : 'bg-white border-brand-border text-brand-text-muted hover:border-brand-primary/20'
              }`}
            >
              {nur.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs flex items-center gap-4">
          <div className="bg-brand-accent/40 text-brand-primary p-3 rounded-xl shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Farm Listings</span>
            <p className="text-2xl font-serif font-black text-brand-primary">{nurseryProducts.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs flex items-center gap-4">
          <div className="bg-brand-warm/10 text-brand-warm p-3 rounded-xl shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Projected Payout</span>
            <p className="text-2xl font-serif font-black text-brand-primary">$2,450.80</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs flex items-center gap-4">
          <div className="bg-brand-muted text-brand-primary p-3 rounded-xl shrink-0 text-xl font-black">
            📈
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Fulfillment Rating</span>
            <p className="text-2xl font-serif font-black text-brand-primary">{selectedNursery.rating} ⭐</p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* New Listing Form (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-brand-border pb-4">
            <PlusCircle className="w-5 h-5 text-brand-primary" />
            <h3 className="font-serif font-bold text-lg text-brand-primary">List a New Plant For Sale</h3>
          </div>

          {success && (
            <div className="bg-brand-accent/35 border border-brand-primary/10 rounded-2xl p-4 text-brand-primary text-xs font-semibold flex items-center gap-2 mb-6 animate-fade-in">
              <Check className="w-4 h-4 text-white bg-brand-primary rounded-full p-0.5" />
              <span>Plant posted successfully! It is now live on the Botanical Marketplace.</span>
            </div>
          )}

          <form onSubmit={handleCreateListing} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Plant Common Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satin Pothos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Scientific Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scindapsus pictus"
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="19.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Stock Units *
                </label>
                <input
                  type="number"
                  required
                  placeholder="20"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Grower Pot Size
                </label>
                <input
                  type="text"
                  placeholder='Medium (6" grower pot)'
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                Nursery Product Description
              </label>
              <textarea
                placeholder="Describe leaf health, root strength, shipping pot, and overall care vibe..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary capitalize"
                >
                  <option value="indoor">Indoor Plants</option>
                  <option value="outdoor">Outdoor Plants</option>
                  <option value="succulents">Succulents & Cacti</option>
                  <option value="herbs">Herbs & Seeds</option>
                  <option value="pots-soil">Pots & Soil</option>
                  <option value="care-tools">Care Tools</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Sunlight
                </label>
                <select
                  value={light}
                  onChange={(e: any) => setLight(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary capitalize"
                >
                  <option value="low">Low Light</option>
                  <option value="indirect">Bright Indirect</option>
                  <option value="direct">Direct Sun</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Watering
                </label>
                <select
                  value={water}
                  onChange={(e: any) => setWater(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary capitalize"
                >
                  <option value="low">Low Need</option>
                  <option value="moderate">Moderate Need</option>
                  <option value="high">High Constant</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Care Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary capitalize"
                >
                  <option value="easy">Easy Care</option>
                  <option value="medium">Medium Care</option>
                  <option value="hard">Expert Only</option>
                </select>
              </div>
            </div>

            {/* Premium Photo Auto-populators */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-text-muted mb-2">
                Plant Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-brand-border rounded-xl p-3 text-xs bg-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary mb-3"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-brand-text-muted font-bold uppercase mr-1">Quick Select Premium Stock Photos:</span>
                {PRESET_PLANT_PHOTOS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className="text-[10px] bg-brand-muted hover:bg-brand-accent text-brand-text-muted hover:text-brand-primary px-3 py-1.5 rounded-full border border-brand-border transition-colors cursor-pointer"
                  >
                    🌱 {p.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="submit-new-listing-btn"
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-primary hover:opacity-90 text-white font-bold py-3 px-6 rounded-full transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-brand-muted disabled:text-brand-text-muted"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-brand-accent fill-brand-accent/25" />
              )}
              <span>Publish Active Farm Listing</span>
            </button>
          </form>
        </div>

        {/* Nursery Active Inventory & Active Packing Orders (1 Column) */}
        <div className="space-y-6">
          {/* Active Inventory List */}
          <div className="bg-white rounded-3xl border border-brand-border p-5 shadow-xs">
            <h4 className="font-serif font-bold text-sm text-brand-primary border-b border-brand-border pb-3 mb-4">
              Farm Inventory ({nurseryProducts.length})
            </h4>
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {nurseryProducts.map((prod) => (
                <div key={prod.id} className="flex gap-3 items-center justify-between">
                  <div className="flex gap-2.5 items-center">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-9 h-9 rounded-xl object-cover bg-brand-muted"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-serif font-bold text-xs text-brand-text leading-tight line-clamp-1">{prod.name}</h5>
                      <span className="text-[10px] text-brand-text-muted capitalize">{prod.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-text block">${prod.price}</span>
                    <span className="text-[9px] text-brand-primary font-bold bg-brand-accent/40 px-2 py-0.5 rounded-full">
                      {prod.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Shipments Queue */}
          <div className="bg-brand-primary text-white rounded-3xl p-5 shadow-sm border border-brand-primary/10">
            <h4 className="font-serif font-bold text-sm border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
              <span>Packing Queue</span>
              <span className="text-[9px] bg-brand-warm text-brand-primary font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                2 Pending
              </span>
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/5">
                <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-wider text-brand-accent">
                  <span>Order #WM-4091</span>
                  <span className="text-brand-warm">Pack Roots</span>
                </div>
                <p className="text-xs font-bold text-white">1x Fiddle Leaf Fig Premium</p>
                <p className="text-[10px] text-white/60 mt-1">Ship to: Austin, TX • Standard Ground</p>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/5">
                <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-wider text-brand-accent">
                  <span>Order #WM-4095</span>
                  <span className="text-brand-accent">Ready to Label</span>
                </div>
                <p className="text-xs font-bold text-white">2x Monstera Deliciosa</p>
                <p className="text-[10px] text-white/60 mt-1">Ship to: Seattle, WA • Heatpack Protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
