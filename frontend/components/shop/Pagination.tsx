export function Pagination() {
  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Product pagination"
    >
      <button className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-100">
        Previous
      </button>
      {[1, 2, 3].map((page) => (
        <button
          key={page}
          className={`min-h-11 min-w-11 rounded-md border px-4 text-sm font-semibold ${
            page === 1
              ? "border-stone-950 bg-stone-950 text-white"
              : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
          }`}
        >
          {page}
        </button>
      ))}
      <button className="min-h-11 rounded-md border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-100">
        Next
      </button>
    </nav>
  );
}
