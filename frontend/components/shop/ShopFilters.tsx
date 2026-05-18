"use client";

import { useState } from "react";

type ShopFiltersProps = {
  categories: any[];
  onApply: (filters: any) => void;
};

const sizes = ["All Sizes", "S", "M", "L", "XL", "Free Size"];
const colors = ["All Colors", "Rose", "Black", "Cream", "Blue", "Red"];

export function ShopFilters({ categories, onApply }: ShopFiltersProps) {
  const [localFilters, setLocalFilters] = useState({
    search: "",
    category: "",
    size: "",
    color: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    // Process values before sending up
    const processedFilters = {
      ...localFilters,
      category: localFilters.category === "All Categories" ? "" : localFilters.category,
      size: localFilters.size === "All Sizes" ? "" : localFilters.size,
      color: localFilters.color === "All Colors" ? "" : localFilters.color,
    };
    onApply(processedFilters);
  };

  const handleReset = () => {
    const resetState = { search: "", category: "", size: "", color: "", minPrice: "", maxPrice: "" };
    setLocalFilters(resetState);
    onApply(resetState);
  };

  return (
    <aside className="rounded-lg border border-stone-200 bg-white p-4 lg:sticky lg:top-28">
      <h2 className="text-lg font-semibold text-stone-950">Filters</h2>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Search</span>
          <input
            type="search"
            name="search"
            value={localFilters.search}
            onChange={handleChange}
            placeholder="Search dresses"
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-teal-700"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Category</span>
          <select
            name="category"
            value={localFilters.category}
            onChange={handleChange}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-teal-700"
          >
            <option>All Categories</option>
            {Array.isArray(categories) && categories.map((cat: any) => (
              <option key={cat.id || cat.name} value={cat.slug || cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Size</span>
          <select
            name="size"
            value={localFilters.size}
            onChange={handleChange}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-teal-700"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Color</span>
          <select
            name="color"
            value={localFilters.color}
            onChange={handleChange}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-teal-700"
          >
            {colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Min Price</span>
            <input
              type="number"
              name="minPrice"
              value={localFilters.minPrice}
              onChange={handleChange}
              placeholder="$0"
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-teal-700"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Max Price</span>
            <input
              type="number"
              name="maxPrice"
              value={localFilters.maxPrice}
              onChange={handleChange}
              placeholder="$500"
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-teal-700"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="min-h-11 w-full rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="min-h-11 w-full rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-stone-100 transition-colors"
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
