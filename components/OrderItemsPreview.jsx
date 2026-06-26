"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

/* =========================
   GROUP DUPLICATE PRODUCTS
========================= */
const groupItems = (items = []) => {
  const map = new Map();

  items.forEach((item) => {
    const id =
      item.product?._id ||
      item.product?.id ||
      item.product?.slug ||
      item.product?.name;

    if (!map.has(id)) {
      map.set(id, {
        ...item,
        quantity: item.quantity,
      });
    } else {
      map.get(id).quantity += item.quantity;
    }
  });

  return Array.from(map.values());
};

/* =========================
   MODAL COMPONENT
========================= */
const ItemsModal = ({ open, onClose, items }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-5 animate-in fade-in zoom-in duration-200"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Order Items</h2>

          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={item.product?.image?.[0]}
                  width={55}
                  height={55}
                  className="rounded-md object-cover border"
                  alt={item.product?.name}
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium line-clamp-2 break-words">
                    {item.product?.brand?.toUpperCase()} | {item.product?.name} | {item.product?.color}
                    {item.size && ` | Size ${item.size}`}
                  </p>
                  <p className="text-xs text-gray-500 space-x-1">
                    <span>Qty: {item.quantity}</span>

                    {item.size && (
                        <>
                        <span>•</span>
                        <span>Size: {item.size}</span>
                        </>
                    )}
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold text-orange-600 whitespace-nowrap">
                ₦{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */
const OrderItemsPreview = ({ items = [] }) => {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);


  const grouped = useMemo(() => groupItems(items), [items]);
  const count = grouped.length;

  const hoverItem = grouped.find((i) => {
    const id =
        i.product?._id ||
        i.product?.id ||
        i.product?.slug ||
        i.product?.name;

    return id === hoveredId;
    });

  /* =========================
     SMALL ORDERS (1–2)
  ========================= */
  if (count <= 2) {
    return (
      <div className="relative">
        <p className="text-xs text-gray-600 mt-2">
          {grouped
            .map((i) => `${i.product?.name} × ${i.quantity}`)
            .join(", ")}
        </p>

        <button
          onClick={() => setOpen(true)}
          className="text-[11px] text-blue-600 mt-1 hover:underline"
        >
          View full items
        </button>

        <ItemsModal open={open} onClose={() => setOpen(false)} items={grouped} />
      </div>
    );
  }

  /* =========================
     MEDIUM ORDERS (3–4)
  ========================= */
  if (count <= 4) {
    return (
      <div className="relative mt-2">
        <div className="text-xs text-gray-600 space-y-1">
          {grouped.map((i, idx) => {
            const id =
              i.product?._id ||
              i.product?.id ||
              i.product?.slug ||
              i.product?.name;

            return (
              <p
                key={id}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-default hover:text-black transition"
              >
                {i.product?.name} × {i.quantity}
              </p>
            );
          })}
        </div>

        {/* FIXED HOVER PREVIEW */}
        {/* {hoverItem?.product?.image?.[0] && (
          <div className="absolute right-0 top-0 z-20">
            <div className="bg-white border shadow-xl rounded-lg p-2 w-[180px]">
              <Image
                src={hoverItem.product.image[0]}
                width={140}
                height={140}
                className="rounded-md object-cover w-full h-[140px]"
                alt="preview"
              />

              <p className="text-xs text-center mt-1 line-clamp-2 break-words">
                {hoverItem.product?.brand?.toUpperCase()} | {hoverItem.product?.name} | {hoverItem.product?.color}
                {hoverItem.size && ` | Size ${hoverItem.size}`}
              </p>
            </div>
          </div>
        )} */}

        <button
          onClick={() => setOpen(true)}
          className="text-[11px] text-blue-600 mt-2 hover:underline"
        >
          View full items
        </button>

        <ItemsModal open={open} onClose={() => setOpen(false)} items={grouped} />
      </div>
    );
  }

  /* =========================
     LARGE ORDERS (5+)
  ========================= */
  return (
    <div className="mt-2">
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {grouped.slice(0, 4).map((item, i) => {
          const id =
            item.product?._id ||
            item.product?.id ||
            item.product?.slug ||
            item.product?.name;

          return (
            <div
              key={id}
              className="relative flex-shrink-0"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <Image
                src={item.product?.image?.[0]}
                alt={item.product?.name}
                width={55}
                height={55}
                className="w-14 h-14 rounded-md border object-cover bg-white"
              />

              <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
                x{item.quantity}
              </span>

              {/* FIXED HOVER PREVIEW */}
              {/* {hovered === i && (
                <div className="absolute -top-28 left-0 z-30 bg-white border shadow-xl rounded-lg p-2 w-[170px]">
                  <Image
                    src={item.product?.image?.[0]}
                    width={140}
                    height={140}
                    className="rounded-md object-cover w-full h-[140px]"
                    alt="preview"
                  />

                  <p className="text-xs text-center mt-1 line-clamp-2 break-words">
                    {item.product?.brand?.toUpperCase()} |{" "}
                    {item.product?.name} |{" "}
                    {item.product?.color}
                  </p>
                </div>
              )} */}
            </div>
          );
        })}

        {grouped.length > 4 && (
          <button
            onClick={() => setOpen(true)}
            className="w-14 h-14 flex items-center justify-center rounded-md border bg-gray-50 text-xs text-gray-600 hover:bg-gray-100 transition"
          >
            +{grouped.length - 4}
          </button>
        )}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="text-[11px] text-blue-600 mt-2 hover:underline"
      >
        View full items
      </button>

      <ItemsModal open={open} onClose={() => setOpen(false)} items={grouped} />
    </div>
  );
};

export default OrderItemsPreview;