import React from 'react';
import { CATEGORIES } from '../config/categories';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  Shirt, 
  Sparkles, 
  Cpu, 
  Utensils, 
  Activity, 
  Gamepad2, 
  Compass, 
  Sun, 
  Tv, 
  Headphones, 
  GraduationCap, 
  HeartHandshake, 
  Home, 
  Car, 
  Smile, 
  TrendingUp,
  X
} from 'lucide-react';

interface CategoryGridProps {
  id?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Shirt: <Shirt className="w-4 h-4 stroke-[2]" />,
  Sparkles: <Sparkles className="w-4 h-4 stroke-[2]" />,
  Cpu: <Cpu className="w-4 h-4 stroke-[2]" />,
  Utensils: <Utensils className="w-4 h-4 stroke-[2]" />,
  Activity: <Activity className="w-4 h-4 stroke-[2]" />,
  Gamepad2: <Gamepad2 className="w-4 h-4 stroke-[2]" />,
  Compass: <Compass className="w-4 h-4 stroke-[2]" />,
  Sun: <Sun className="w-4 h-4 stroke-[2]" />,
  Tv: <Tv className="w-4 h-4 stroke-[2]" />,
  Headphones: <Headphones className="w-4 h-4 stroke-[2]" />,
  GraduationCap: <GraduationCap className="w-4 h-4 stroke-[2]" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4 stroke-[2]" />,
  Home: <Home className="w-4 h-4 stroke-[2]" />,
  Car: <Car className="w-4 h-4 stroke-[2]" />,
  Smile: <Smile className="w-4 h-4 stroke-[2]" />,
  TrendingUp: <TrendingUp className="w-4 h-4 stroke-[2]" />,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({ id }) => {
  const { selectedCategory, setSelectedCategory } = useMarketplace();

  const handleTileClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catName);
    }
  };

  return (
    <section id={id} className="py-8 border-b border-[var(--border-primary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
              Featured verticals
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Filter campaigns and creators by market segment
            </p>
          </div>

          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              <span>Clear filter ({selectedCategory})</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 16 Category Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const hasImage = Boolean(cat.imageUrl);

            return (
              <button
                key={cat.id}
                onClick={() => handleTileClick(cat.name)}
                style={{
                  backgroundColor: isSelected ? undefined : (hasImage ? undefined : cat.bgPastel),
                }}
                className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all duration-200 text-left flex flex-col justify-between h-24 hover:-translate-y-0.5 hover:shadow-2xs cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] ring-2 ring-[var(--accent)]/30'
                    : hasImage
                    ? 'border-white/20 text-white shadow-xs'
                    : 'border-[var(--border-primary)] text-[#2B2622]'
                }`}
              >
                {/* Background image when provided */}
                {hasImage && (
                  <>
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div
                      className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
                        isSelected
                          ? 'bg-[var(--btn-primary-bg)]/80'
                          : 'bg-gradient-to-t from-black/85 via-black/35 to-black/25 group-hover:from-black/75'
                      }`}
                    />
                  </>
                )}

                <div className="relative z-10 flex items-center justify-between w-full">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-[var(--btn-primary-text)]'
                        : hasImage
                        ? 'bg-white/90 text-[#2B2622] shadow-xs backdrop-blur-xs'
                        : 'bg-white/60 text-[#2B2622]'
                    }`}
                  >
                    {iconMap[cat.iconName]}
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                  )}
                </div>

                <div className="relative z-10">
                  <span
                    className={`block text-xs font-bold font-['Archivo'] truncate ${
                      hasImage && !isSelected ? 'text-white drop-shadow-sm' : ''
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
