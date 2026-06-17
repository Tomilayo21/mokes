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

export default function SubCatFilter({ 
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

    if (name === "color") {
      params.set(name, value);
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
    const color = searchParams.get("color");
    const brand = searchParams.get("brand");
    const min = searchParams.get("min");
    const max = searchParams.get("max");
    const sort = searchParams.get("sort") as SortKey | null;

    const chips: { name: string; label: string }[] = [];

    if (color) {
      chips.push({
        name: "color",
        label: color.charAt(0).toUpperCase() + color.slice(1),
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



  const colors = [
    ...new Set(
      products
        .map((p) => p.color?.trim())
        .filter(Boolean)
    ),
  ].sort(); 


  const collectionOptions = [

    ...colors.map((color) => ({
      label: color,
      value: `color:${color}`,
    })),
  ];


  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Summary Chips JsYk  */}


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
                      {searchParams.get("color") || "All collections"}
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

