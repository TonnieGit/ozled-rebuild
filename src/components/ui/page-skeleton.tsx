/** Shell shown while an unlisted path streams in (Cache Components App Shell). */
export function PageSkeleton() {
  return (
    <div className="container-x animate-pulse pt-6 pb-8 motion-reduce:animate-none" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-48 rounded bg-bg-muted" />
      <div className="mt-6 h-10 w-2/3 max-w-xl rounded bg-bg-muted" />
      <div className="mt-3 h-5 w-full max-w-2xl rounded bg-bg-muted" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] rounded-lg bg-bg-muted" />
        ))}
      </div>
    </div>
  );
}
