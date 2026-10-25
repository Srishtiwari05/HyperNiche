'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FDF6EC] dark:bg-[#0B0B0B] text-[#2B2622] dark:text-[#EAE5DF] flex items-center justify-center transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#F06A4D] border-t-transparent animate-spin"></div>
        <span className="text-xs font-bold tracking-wider text-[#736B63] font-['Archivo']">
          Loading Hyperniche...
        </span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <App />;
}
