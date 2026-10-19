import { Product } from '../types';
import { Star, Flame, Droplets, Sun, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isAiMatch?: boolean;
}

export default function ProductCard({ product, onSelect, onAddToCart, isAiMatch }: ProductCardProps) {
  const getLightIcon = (light: string) => {
    switch (light) {
      case 'low': return <Sun className="w-3.5 h-3.5 text-slate-400" />;
      case 'indirect': return <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />;
      case 'direct': return <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />;
      default: return null;
    }
  };

  const getWaterIcon = (water: string) => {
    switch (water) {
      case 'low': return <Droplets className="w-3.5 h-3.5 text-blue-300" />;
      case 'moderate': return <Droplets className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />;
      case 'high': return <Droplets className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />;
      default: return null;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-brand-accent text-brand-primary border-brand-primary/10';
      case 'medium': return 'bg-[#F2A359]/10 text-amber-800 border-[#F2A359]/20';
      case 'hard': return 'bg-brand-muted text-brand-text-muted border-brand-border';
      default: return 'bg-brand-muted text-brand-text-muted';
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-2xl border border-brand-border hover:border-brand-primary/30 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
      onClick={() => onSelect(product)}
    >
      {/* AI Match Badge */}
      {isAiMatch && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-brand-accent/95 backdrop-blur-xs text-brand-primary text-xs px-2.5 py-1 rounded-full font-semibold border border-brand-primary/10 animate-pulse">
          <Sparkles className="w-3 h-3 text-brand-primary fill-brand-primary/15" />
          <span>99% AI Match</span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square bg-brand-muted overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs text-[11px] font-medium text-brand-text px-2 py-0.5 rounded-md border border-brand-border">
          {product.size}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Nursery Tag */}
          <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-green-muted mb-1">
            {product.nurseryName}
          </p>

          {/* Plant Name */}
          <h3 className="text-base font-serif font-semibold text-brand-primary line-clamp-1 leading-snug transition-colors">
            {product.name}
          </h3>

          {/* Scientific Name */}
          <p className="text-xs italic text-brand-green-muted mb-2 line-clamp-1">
            {product.scientificName}
          </p>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-brand-warm">
              <Star className="w-3.5 h-3.5 fill-brand-warm text-brand-warm" />
            </div>
            <span className="text-xs font-semibold text-brand-text">{product.rating}</span>
            <span className="text-[11px] text-brand-text-muted">({product.reviewsCount})</span>
          </div>

          {/* Attribute Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-brand-text bg-brand-muted px-2 py-0.5 rounded-sm border border-brand-border">
              {getLightIcon(product.light)}
              <span className="capitalize">{product.light} Sun</span>
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-brand-text bg-brand-muted px-2 py-0.5 rounded-sm border border-brand-border">
              {getWaterIcon(product.water)}
              <span className="capitalize">{product.water} Water</span>
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-sm border capitalize ${getDifficultyColor(product.difficulty)}`}>
              {product.difficulty} Care
            </span>
          </div>
        </div>

        {/* Pricing and CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-brand-border">
          <div>
            <span className="text-xs text-brand-text-muted block leading-none">Price</span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-sans font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
              {product.isPrime && (
                <span className="inline-flex items-center text-[9px] text-blue-600 font-extrabold italic tracking-tighter bg-blue-50/80 px-1 rounded border border-blue-100">
                  prime
                </span>
              )}
            </div>
          </div>
          <button
            id={`add-to-cart-btn-${product.id}`}
            className="bg-brand-primary hover:opacity-90 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
