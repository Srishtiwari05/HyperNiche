type PageLoadingProps = {
  label: string;
  layout?: 'cards' | 'rows';
};

export function PageLoading({ label, layout = 'cards' }: PageLoadingProps) {
  const count = layout === 'cards' ? 6 : 4;

  return (
    <div role="status" aria-label={label} aria-busy="true" className="motion-fade-up">
      <span className="sr-only">{label}</span>
      <div className={layout === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 ${layout === 'cards' ? 'min-h-52' : ''}`}
          >
            <div className="h-3 w-1/3 rounded bg-zinc-800 animate-pulse" />
            <div className="mt-4 h-5 w-2/3 rounded bg-zinc-800 animate-pulse" />
            <div className="mt-3 h-3 w-full rounded bg-zinc-800 animate-pulse" />
            <div className="mt-2 h-3 w-4/5 rounded bg-zinc-800 animate-pulse" />
            {layout === 'cards' && <div className="mt-8 h-9 w-full rounded-lg bg-zinc-800 animate-pulse" />}
          </div>
        ))}
      </div>
    </div>
  );
}
