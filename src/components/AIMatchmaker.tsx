import { useState } from 'react';
import { QuizAnswers, Product } from '../types';
import { Sparkles, Loader2, ArrowRight, ArrowLeft, RefreshCw, Star, Heart } from 'lucide-react';

interface AIMatchmakerProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

const INITIAL_ANSWERS: QuizAnswers = {
  location: 'indoor',
  light: 'indirect',
  watering: 'moderate',
  pets: 'no',
  difficulty: 'beginner',
  size: 'any'
};

export default function AIMatchmaker({ products, onAddToCart, onSelectProduct }: AIMatchmakerProps) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_ANSWERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI Recommendation results
  const [results, setResults] = useState<{
    persona: string;
    profileMarkdown: string;
    recommendedCategories: string[];
    recommendedFeatures: string[];
  } | null>(null);

  // Filter actual products based on recommendations
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleSelect = (field: keyof QuizAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setStep(1);
    setAnswers(INITIAL_ANSWERS);
    setResults(null);
    setMatchedProducts([]);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);

        // Find actual products that match the recommended categories & features
        const matched = products.filter(prod => {
          // Check category match
          const categoryMatch = data.recommendedCategories.some(
            (cat: string) => prod.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(prod.category)
          );

          // Check feature matches (e.g. Pet Friendly, Air Purifying, Low Maintenance)
          const featureMatch = data.recommendedFeatures.some(
            (feat: string) => prod.features.some(f => f.toLowerCase().includes(feat.toLowerCase()) || feat.toLowerCase().includes(f.toLowerCase()))
          );

          // Filter by pet-safety if user has pets
          if (answers.pets === 'yes') {
            const isToxicOrNotFriendly = prod.name.toLowerCase().includes('fiddle') || prod.name.toLowerCase().includes('monstera');
            if (isToxicOrNotFriendly) return false; // filter out non-pet friendly ones
          }

          return categoryMatch || featureMatch;
        });

        // Fallback: If no exact features match, just show category matches or top rated
        setMatchedProducts(matched.length > 0 ? matched.slice(0, 4) : products.slice(0, 3));
      } else {
        setError('Our plant expert got lost in the greenhouse. Please try submitting again.');
      }
    } catch (err) {
      setError('Could not connect to the matchmaking engine. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-matchmaker-view" className="max-w-4xl mx-auto px-4 py-8 text-brand-text">
      {/* Header card when quiz is not complete */}
      {!results && (
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1 bg-brand-accent text-brand-primary text-[11px] font-bold px-3.5 py-1 rounded-full uppercase mb-4 border border-brand-primary/10">
            <Sparkles className="w-3.5 h-3.5 fill-brand-warm text-brand-warm" />
            <span>AI Botanical Finder</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-primary mb-2 tracking-tight">Find Your Perfect Plant Match</h1>
          <p className="text-brand-text-muted text-xs sm:text-sm">
            Take our master-botanist interactive quiz. Our Gemini Matchmaker analyzes your space and lifestyle to select plants you are guaranteed to keep thriving.
          </p>
        </div>
      )}

      {/* MATCHMAKER RESULTS CARD */}
      {results && !loading && (
        <div className="space-y-8 animate-fade-in">
          {/* Persona Hero */}
          <div className="bg-brand-primary text-white rounded-3xl p-6 lg:p-10 shadow-xs border border-brand-primary/10 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-12 scale-150 pointer-events-none text-9xl">
              🌿
            </div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent mb-2 block">
                Your Custom Botanical Match Profile
              </span>
              <h2 className="text-3xl lg:text-4xl font-serif font-black text-white mb-4 tracking-tight leading-none">
                {results.persona}
              </h2>
              <p className="text-brand-muted/90 text-sm leading-relaxed mb-6 font-sans">
                {results.profileMarkdown}
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {results.recommendedFeatures.map((feat, idx) => (
                  <span
                    key={idx}
                    className="bg-white/10 border border-white/10 text-[11px] font-semibold text-white px-3.5 py-1 rounded-full"
                  >
                    ✦ {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Matched Products Shelf */}
          <div>
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-6">
              <h3 className="font-serif font-bold text-lg text-brand-primary flex items-center gap-2">
                <span>Matched Flora for {answers.location === 'indoor' ? 'Indoors' : 'Outdoors'}</span>
                <span className="text-xs bg-brand-accent text-brand-primary px-2.5 py-0.5 rounded-full font-bold">
                  Recommended For You
                </span>
              </h3>
              <button
                onClick={handleReset}
                className="text-brand-text-muted hover:text-brand-primary text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Matchmaker</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {matchedProducts.map((prod) => (
              <div
                key={prod.id}
                id={`matched-prod-${prod.id}`}
                onClick={() => onSelectProduct(prod)}
                className="group bg-white rounded-2xl border border-brand-border hover:border-brand-primary/30 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden bg-brand-muted">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    99% Match
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-semibold uppercase text-brand-primary tracking-wider">
                      {prod.nurseryName}
                    </span>
                    <h4 className="font-serif font-bold text-brand-text text-sm line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-xs italic text-brand-text-muted mb-2">{prod.scientificName}</p>

                    <div className="flex items-center gap-1 mb-3 text-xs font-medium text-brand-text-muted">
                      <Star className="w-3.5 h-3.5 fill-brand-warm text-brand-warm" />
                      <span className="text-brand-text font-bold">{prod.rating}</span>
                      <span className="text-brand-border">•</span>
                      <span className="capitalize text-[11px]">{prod.difficulty} Care</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                    <span className="font-serif font-bold text-sm text-brand-text">${prod.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(prod);
                      }}
                      className="bg-brand-primary hover:opacity-90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

      {/* LOADING SCREEN */}
      {loading && (
        <div className="bg-white rounded-3xl border border-brand-border p-10 py-16 text-center max-w-lg mx-auto shadow-xs animate-fade-in">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto mb-4" />
          <h3 className="font-serif font-black text-lg text-brand-primary mb-1.5">Consulting the Green Oracle</h3>
          <p className="text-brand-text-muted text-xs max-w-xs mx-auto leading-relaxed">
            Gemini is matching sunlight vectors, checking toxicity, water tolerance profiles, and harvesting direct-from-nursery listings...
          </p>
        </div>
      )}

      {/* ERROR CARD */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center max-w-md mx-auto shadow-xs mb-6 animate-fade-in">
          <p className="text-red-700 text-sm font-semibold mb-4">{error}</p>
          <button
            onClick={handleReset}
            className="bg-brand-primary hover:opacity-90 text-white text-xs font-bold py-2 px-5 rounded-full transition-colors cursor-pointer"
          >
            Restart Finder
          </button>
        </div>
      )}

      {/* STEPS PROCESSOR */}
      {!results && !loading && !error && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-10 max-w-2xl mx-auto shadow-xs">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              Step {step} of 6
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`w-5 h-1.5 rounded-full transition-all ${
                    i <= step ? 'bg-brand-primary' : 'bg-brand-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: LOCATION */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Where will your plant live?</h3>
              <p className="text-brand-text-muted text-xs mb-6">Choose the main sanctuary environment.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'indoor', title: '🏡 Fully Indoors', desc: 'Living room, bedroom, bathroom, desk' },
                  { id: 'outdoor', title: '🌳 Fully Outdoors', desc: 'Garden bed, patio pot, open deck' },
                  { id: 'both', title: '🌿 Transitional / Patio', desc: 'Can move in or out depending on season' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('location', opt.id)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      answers.location === opt.id
                        ? 'border-brand-primary bg-brand-accent/40 ring-2 ring-brand-primary/10'
                        : 'border-brand-border hover:border-brand-primary/20 bg-brand-muted/10'
                    }`}
                  >
                    <h4 className="font-bold text-brand-text text-sm mb-1">{opt.title}</h4>
                    <p className="text-[11px] text-brand-text-muted leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SUNLIGHT */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Describe the available light</h3>
              <p className="text-brand-text-muted text-xs mb-6">Sunlight is the food. Be as honest as possible.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'low', title: '☁️ Low / Gentle Light', desc: 'Corner rooms, tiny windows, office fluorescents' },
                  { id: 'indirect', title: '☀️ Bright Indirect Light', desc: 'Near windows but shielded from burning rays' },
                  { id: 'direct', title: '🔥 Direct Sunlight', desc: 'Drenched in blazing sun for 6+ hours a day' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('light', opt.id)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      answers.light === opt.id
                        ? 'border-brand-primary bg-brand-accent/40 ring-2 ring-brand-primary/10'
                        : 'border-brand-border hover:border-brand-primary/20 bg-brand-muted/10'
                    }`}
                  >
                    <h4 className="font-bold text-brand-text text-sm mb-1">{opt.title}</h4>
                    <p className="text-[11px] text-brand-text-muted leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: WATERING */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">What are your watering habits?</h3>
              <p className="text-brand-text-muted text-xs mb-6">No shame here! We have a plant for every lifestyle.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'forgetful', title: '🌵 The Forgetful parent', desc: 'Sometimes I go 2-3 weeks without checking.' },
                  { id: 'moderate', title: '💧 Balanced & Routine', desc: 'I check the soil every weekend consistently.' },
                  { id: 'attentive', title: '🌧️ The Over-Parent', desc: 'I love misting and checking them daily.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('watering', opt.id)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      answers.watering === opt.id
                        ? 'border-brand-primary bg-brand-accent/40 ring-2 ring-brand-primary/10'
                        : 'border-brand-border hover:border-brand-primary/20 bg-brand-muted/10'
                    }`}
                  >
                    <h4 className="font-bold text-brand-text text-sm mb-1">{opt.title}</h4>
                    <p className="text-[11px] text-brand-text-muted leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: PETS */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Do you have curious pets?</h3>
              <p className="text-brand-text-muted text-xs mb-6">We will match strictly non-toxic, pet-safe flora if needed.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'yes', title: '🐾 Yes, Curious Pets', desc: 'I have cats or dogs who love nibbling green leaves.' },
                  { id: 'no', title: '🏡 No Pets / Out of Reach', desc: 'No pets, or my plants sit safely on high shelves.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('pets', opt.id)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      answers.pets === opt.id
                        ? 'border-brand-primary bg-brand-accent/40 ring-2 ring-brand-primary/10'
                        : 'border-brand-border hover:border-brand-primary/20 bg-brand-muted/10'
                    }`}
                  >
                    <h4 className="font-bold text-brand-text text-sm mb-1">{opt.title}</h4>
                    <p className="text-[11px] text-brand-text-muted leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: DIFFICULTY */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">What is your green thumb skill level?</h3>
              <p className="text-brand-text-muted text-xs mb-6">Be honest: collectors are welcome, but beginners excel with snake plants!</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'beginner', title: '🐣 Total Novice', desc: 'I want something practically plastic and easy.' },
                  { id: 'intermediate', title: '🌿 Plant Hobbyist', desc: 'I know some basics and can handle mild temperaments.' },
                  { id: 'expert', title: '🪴 Master Collector', desc: 'Give me rare, complex, high-needs botanical gems.' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('difficulty', opt.id)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      answers.difficulty === opt.id
                        ? 'border-brand-primary bg-brand-accent/40 ring-2 ring-brand-primary/10'
                        : 'border-brand-border hover:border-brand-primary/20 bg-brand-muted/10'
                    }`}
                  >
                    <h4 className="font-bold text-brand-text text-sm mb-1">{opt.title}</h4>
                    <p className="text-[11px] text-brand-text-muted leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: SIZE */}
          {step === 6 && (
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Choose your ideal plant size</h3>
              <p className="text-brand-text-muted text-xs mb-6">Desktop buddy, statement tree, or anything in between?</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'small', title: '🌱 Small', desc: 'Window, desk, shelf (3-4" pots)' },
                  { id: 'medium', title: '🪴 Medium', desc: 'Tabletop, plant stand (5-6" pots)' },
                  { id: 'large', title: '🌳 Large', desc: 'Corner floor statement (8-10" pots)' },
                  { id: 'any', title: '🌾 Any Size', desc: 'Show me any beautiful healthy plant!' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect('size', opt.id)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      answers.size === opt.id
                        ? 'border-brand-primary bg-brand-accent/40 ring-2 ring-brand-primary/10'
                        : 'border-brand-border hover:border-brand-primary/20 bg-brand-muted/10'
                    }`}
                  >
                    <h4 className="font-bold text-brand-text text-sm mb-1">{opt.title}</h4>
                    <p className="text-[11px] text-brand-text-muted leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center justify-between border-t border-brand-border pt-6 mt-8">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="text-brand-text-muted hover:text-brand-primary disabled:text-brand-border font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {step < 6 ? (
              <button
                onClick={handleNext}
                className="bg-brand-primary hover:opacity-90 text-white font-bold text-xs py-2.5 px-6 rounded-full flex items-center gap-1 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="submit-quiz-btn"
                onClick={handleSubmit}
                className="bg-brand-primary hover:opacity-90 text-white font-bold text-xs py-2.5 px-6 rounded-full flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-brand-accent fill-brand-accent/25" />
                <span>Calculate My Matches</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
