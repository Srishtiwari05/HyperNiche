import React from 'react';
import { CATEGORIES } from '../config/categories';
import { useMarketplace } from '../context/MarketplaceContext';

export const Footer: React.FC = () => {
  const { setSelectedCategory } = useMarketplace();

  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border-primary)] pt-12 pb-8 text-[var(--text-primary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--border-primary)]">
          
          {/* Col 1: Brand & Ethos */}
          <div className="md:col-span-2">
            <span className="text-2xl font-black tracking-tight text-[var(--text-primary)] font-['Archivo']">
              Hyperniche<span className="text-[var(--accent)]">.</span>
            </span>
            <p className="mt-3 text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
              The direct marketplace where forward-thinking Indian consumer brands partner with authentic creators. Direct relationships, zero middlemen, guaranteed INR payouts.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono font-medium text-[var(--text-muted)]">
              <span>Currency: Indian Rupees (INR ₹)</span>
              <span>•</span>
              <span>Bengaluru • Mumbai • Delhi</span>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-['Archivo'] mb-3">
              Browse verticals
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-[var(--text-secondary)]">
              {CATEGORIES.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.name);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-[var(--accent)] transition-colors truncate cursor-pointer"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Platform Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-['Archivo'] mb-3">
              Platform standards
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <li>✓ Direct deals, no agency</li>
              <li>✓ Milestone-protected payouts</li>
              <li>✓ Free during pilot</li>
              <li>✓ INR payments</li>
              <li>✓ In-app messaging</li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-3">
          <p>© 2026 Hyperniche Technologies India. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Terms of service</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Privacy policy</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Creator agreement</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
