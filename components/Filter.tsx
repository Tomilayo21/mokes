"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, SlidersHorizontal, ListFilter } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useAppContext } from "@/context/AppContext";

type FilterBarProps = {
  products: any[];
  displayCount: number;
  totalCount: number;
};

export default function FilterBar({ 
    products,
    displayCount,
    totalCount,
  }: FilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const { currency } = useAppContext();
  type SortKey =
    | "asc price"
    | "desc price"
    | "asc date"
    | "desc date"
    | "asc alpha"
    | "desc alpha";

  const sortLabels: Record<SortKey, string> = {
    "asc price": "Price (low → high)",
    "desc price": "Price (high → low)",
    "asc date": "Oldest",
    "desc date": "Newest",
    "asc alpha": "A → Z",
    "desc alpha": "Z → A",
  };

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // ✅ PRICE FILTER (handled separately)
    if (name === "price") {
      params.delete("min");
      params.delete("max");

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.push(newUrl);
      return;
    }

    if (name === "brand" || name === "category" || name === "subcategory" || name === "color") {
      params.set(name, value); // keep original case
    } else {
      params.set(name, value.toLowerCase());
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  const triggerClasses =
    "flex items-center justify-between w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 bg-white";

  const itemClasses =
    "text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 data-[highlighted]:bg-gray-200 data-[highlighted]:outline-none data-[state=checked]:bg-gray-300";
    // data-[state=checked]:bg-gray-200 dark:data-[state=checked]:bg-gray-100

  const summaryChips = useMemo(() => {
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const color = searchParams.get("color");
    const brand = searchParams.get("brand");
    const min = searchParams.get("min");
    const max = searchParams.get("max");
    const sort = searchParams.get("sort") as SortKey | null;

    const chips: { name: string; label: string }[] = [];

    if (category) {
      chips.push({
        name: "category",
        label: category.charAt(0).toUpperCase() + category.slice(1),
      });
    }

    if (subcategory) {
      chips.push({
        name: "subcategory",
        label: subcategory.charAt(0).toUpperCase() + subcategory.slice(1),
      });
    }

    if (color) {
      chips.push({
        name: "color",
        label: color.charAt(0).toUpperCase() + color.slice(1),
      });
    }

    if (brand) {
      chips.push({
        name: "brand",
        label: brand.charAt(0).toUpperCase() + brand.slice(1),
      });
    }

    if (min || max) {
      chips.push({
        name: "price",
        label: `${min || 0} - ${max || "∞"}`,
      });
    }

    if (sort && sortLabels[sort]) {
      chips.push({
        name: "sort",
        label: sortLabels[sort],
      });
    }

    return chips;
  }, [searchParams.toString()]);

  const categories = [
    ...new Set(
      products
        .map((p) => p.category?.trim())
        .filter(Boolean)
    ),
  ].sort();

  const subcategories = [
    ...new Set(
      products
        .map((p) => (p.subCategory || p.subcategory)?.trim())
        .filter(Boolean)
    ),
  ].sort();

  const colors = [
    ...new Set(
      products
        .map((p) => p.color?.trim())
        .filter(Boolean)
    ),
  ].sort(); 

  const brands = [
    ...new Set(
      products
        .map((p) => p.brand?.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const collectionOptions = [
    ...categories.map((category) => ({
      label: category,
      value: `category:${category}`,
    })),

    ...subcategories.map((subcategory) => ({
      label: subcategory,
      value: `subcategory:${subcategory}`,
    })),

    ...colors.map((color) => ({
      label: color,
      value: `color:${color}`,
    })),
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Summary Chips JsYk  */}
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-700">
        {summaryChips.length > 0 && (
          <>
            <span className="font-medium text-gray-500 mr-1">
              Showing results for:
            </span>

            {summaryChips.map((chip, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-[var(--sage)] border border-zinc-500 rounded-sm text-xs md:text-sm"
              >
                {chip.label}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());

                    if (chip.name === "price") {
                      params.delete("min");
                      params.delete("max");
                    } else {
                      params.delete(chip.name);
                    }

                    router.push(`${window.location.pathname}?${params.toString()}`);
                  }}
                  className="ml-1 text-[var(--sage)] hover:text-[var(--sage-dark]) focus:outline-none"
                  aria-label={`Remove ${chip.label}`}
                >
                  ×
                </button>
              </span>
            ))}

            {/* === Clear All Button === */}
            <button
              onClick={() => {
                const params = new URLSearchParams(window.location.search);
                params.delete("category");
                params.delete("subcategory");
                params.delete("color");
                params.delete("brand");
                params.delete("min");
                params.delete("max");
                params.delete("sort");
                params.delete("page");
                const newUrl = `${window.location.pathname}`;
                router.push(newUrl); // navigates to base path (cleared filters)
              }}
              className="ml-2 text-xs md:text-sm cursor-pointer text-gray-600 hover:text-gray-800 font-medium underline decoration-underline-offset-2"
            >
              Clear all
            </button>
          </>
        )}
      </div>

      {/* Filter Control JsYk */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
        {/* Left section: Filters */}
        <div className="w-full md:w-auto">
          {/* Accordion Body */}
          <div>
            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-4 bg-white py-3">
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Filter by
                </label>

                <Select.Root
                  value={searchParams.get("filter") || ""}
                  onValueChange={(value) => {
                    const params = new URLSearchParams(searchParams.toString());

                    const [type, val] = value.split(":");

                    params.delete("category");
                    params.delete("subcategory");
                    params.delete("color");

                    params.set(type, val.toLowerCase());

                    router.push(
                      `${window.location.pathname}?${params.toString()}`
                    );
                  }}
                >
                  <Select.Trigger
                    className={`${triggerClasses} w-auto min-w-[12rem] flex items-center justify-between`}
                  >
                    <span className="text-gray-500 text-xs capitalize">
                      {searchParams.get("category") ||
                      searchParams.get("subcategory") ||
                      searchParams.get("color") ||
                      "All collections"}
                    </span>

                    <Select.Icon>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      avoidCollisions
                      collisionPadding={8}
                      onWheel={(e) => e.stopPropagation()}
                      className="bg-white dark:bg-white text-black border border-gray-300 rounded-sm shadow-sm z-50 mt-1 w-full sm:w-auto"
                    >
                      <Select.Viewport className="p-2 max-h-60 overflow-y-auto overscroll-contain">
                        {collectionOptions.map((option) => (
                          <Select.Item
                            key={option.value}
                            value={option.value}
                            className={itemClasses}
                          >
                            <Select.ItemText>
                              {option.label}
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              {/* Generic Selects */}
              {[
                {
                  name: "brand",
                  label: "Brand",
                  options: brands,
                },
              ].map((filter) => (
                <div
                  key={filter.name}
                  className="flex flex-col w-full sm:w-auto relative"
                >
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {filter.label}
                  </label>
                  <Select.Root
                    value={searchParams.get("brand") || ""}
                    onValueChange={(value) =>
                      handleFilterChange("brand", value)
                    }
                  >
                    <Select.Trigger
                      className={`${triggerClasses} w-auto min-w-[8rem] flex items-center justify-between`}
                    >
                      <div className="text-gray-500 text-xs">
                        {searchParams.get(filter.name) || `Select ${filter.label.toLowerCase()}`}
                      </div>
                      <Select.Icon>
                        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
                      </Select.Icon>
                    </Select.Trigger>



                    <Select.Content
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      avoidCollisions
                      collisionPadding={8}
                      onWheel={(e) => e.stopPropagation()}
                      className="bg-white dark:bg-white text-black border border-gray-300 rounded-sm shadow-sm z-50 mt-1 w-full sm:w-auto"
                    >
                      <Select.Viewport className="p-2 max-h-60 overflow-y-auto overscroll-contain">
                        {filter.options.map((opt) => (
                          <Select.Item
                            key={opt}
                            value={opt}
                            className={itemClasses}
                          >
                            {opt}
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Root>
                </div>
              ))}

              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Sort
                </label>

                  <Select.Root
                    value={searchParams.get("sort") || ""}
                    onValueChange={(value) => handleFilterChange("sort", value)}
                  >
                    <Select.Trigger
                      className={`${triggerClasses} w-auto min-w-[9rem] flex items-center justify-between gap-2`}
                    >
                      {/* === Left Section: Icon + Label === */}
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <span>
                          {(() => {
                            const sort = searchParams.get("sort");
                            if (sort === "asc price") return "Price, low to high";
                            if (sort === "desc price") return "Price, high to low";
                            if (sort === "asc date") return "Date, Old to New";
                            if (sort === "desc date") return "Date, New to Old";
                            if (sort === "asc alpha") return "Alphabetically, A to Z";
                            if (sort === "desc alpha") return "Alphabetically, Z to A";
                            return "Sort order";
                          })()}
                        </span>
                      </div>

                      {/* === Right Section: Chevron === */}
                      <Select.Icon>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Content
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      avoidCollisions
                      collisionPadding={8}
                      onWheel={(e) => e.stopPropagation()}
                      className="bg-white dark:bg-white text-black border border-gray-300 dark:border-gray-300 rounded-sm shadow-sm z-50 mt-1 w-full sm:w-auto"
                    >
                      <Select.Viewport className="p-2 max-h-60 overflow-y-auto overscroll-contain">
                        {[
                          { label: "Price, low to high", value: "asc price" },
                          { label: "Price, high to low", value: "desc price" },
                          { label: "Date, New to Old", value: "desc date" },
                          { label: "Date, Old to New", value: "asc date" },
                          { label: "Alphabetically, A to Z", value: "asc alpha" },
                          { label: "Alphabetically, Z to A", value: "desc alpha" },
                        ].map((item) => (
                          <Select.Item
                            key={item.value}
                            value={item.value}
                            className={itemClasses}
                          >
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Root>
              </div>

              

            </div>
          </div>
        </div>

        {/* Right section: Sort */}
        <div className="flex flex-col w-full sm:w-auto mt-3 md:mt-0">
          <p className="text-xs text-gray-500 italic">
            Showing{" "}
            <span className="font-medium">{displayCount}</span>{" "}
            of{" "}
            <span className="font-medium">{totalCount}</span>{" "}
            items
          </p>
        </div>

      </div>
    </div>
  );
}

