import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, FileText, IndianRupee } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const { userProfile } = useAuth();
  const isBusiness = userProfile?.role === 'business';

  const steps = isBusiness
    ? [
        {
          num: '01',
          title: 'Post Brief or Browse Creators',
          desc: 'Specify product deliverables, category, deadline, and fixed compensation in INR. Or directly search creators with authentic metrics.',
          icon: <Target className="w-5 h-5" />,
          pastel: '#FFE3D3',
          darkBg: '#34241E',
        },
        {
          num: '02',
          title: 'Review Pitches & Confirm Deliverables',
          desc: 'Receive tailored creative proposals from interested creators. Review concepts, negotiate rates, and accept qualified candidates.',
          icon: <FileText className="w-5 h-5" />,
          pastel: '#FFF0B8',
          darkBg: '#36301A',
        },
        {
          num: '03',
          title: 'Direct Chat & Milestone Payouts',
          desc: 'Ship products, exchange script drafts in real-time messaging, review proof of posting, and release payments without broker commissions.',
          icon: <IndianRupee className="w-5 h-5" />,
          pastel: '#D9F2E6',
          darkBg: '#18332A',
        },
      ]
    : [
        {
          num: '01',
          title: 'Find Open Brand Deals',
          desc: 'Filter 16 niche verticals across D2C fashion, beauty, tech, and food. View exact compensation in INR and deliverable requirements upfront.',
          icon: <Target className="w-5 h-5" />,
          pastel: '#FFE3D3',
          darkBg: '#34241E',
        },
        {
          num: '02',
          title: 'Pitch Your Creative Angle',
          desc: 'Apply directly with your proposed rate and creative hook. Stand out by highlighting your genuine audience demographics and past reels.',
          icon: <FileText className="w-5 h-5" />,
          pastel: '#FFF0B8',
          darkBg: '#36301A',
        },
        {
          num: '03',
          title: 'Create Content & Get Paid',
          desc: 'Once accepted, chat directly with the brand founder, receive free product samples, post on Instagram/YouTube, and get paid directly in INR.',
          icon: <IndianRupee className="w-5 h-5" />,
          pastel: '#D9F2E6',
          darkBg: '#18332A',
        },
      ];

  return (
    <section className="py-12 border-b border-[var(--border-primary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Direct commerce workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] font-['Archivo'] mt-1">
            How Hyperniche works
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
            Transparent creator commerce designed for direct Indian brand partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-6 relative hover:-translate-y-0.5 hover:shadow-2xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    style={{ backgroundColor: s.pastel }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[#2B2622] border border-[var(--border-primary)] font-bold text-sm"
                  >
                    {s.icon}
                  </div>
                  <span className="text-2xl font-black text-[var(--text-primary)]/20 font-['Archivo']">
                    {s.num}
                  </span>
                </div>

                <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)] font-['Archivo'] mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--border-primary)]/60 flex items-center text-xs font-semibold text-[var(--text-muted)]">
                <span>Verified direct deal</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
