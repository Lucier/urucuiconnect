const block = "animate-pulse rounded-xl bg-border/60";

export function CategoryGridSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="-mx-4 flex gap-2 overflow-hidden px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:px-0 lg:grid-cols-5"
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={`${block} h-11 w-32 shrink-0 rounded-full sm:h-24 sm:w-auto sm:shrink sm:rounded-xl`} />
      ))}
    </div>
  );
}

export function ServiceGridSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={`${block} h-64 sm:h-72`} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className={`${block} h-56`} />
      <div className={`${block} h-8 w-2/3`} />
      <div className={`${block} h-5 w-1/3`} />
      <div className={`${block} h-32`} />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className={`${block} h-12`} />
      <div className={`${block} h-12`} />
      <div className={`${block} h-28`} />
      <div className={`${block} h-12`} />
    </div>
  );
}
