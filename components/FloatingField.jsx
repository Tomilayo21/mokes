"use client";

import { useState } from "react";

export default function FloatingField({
  type = "input",
  label,
  value,
  onChange,
  options = [],
  icon: Icon,
  rows = 4,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  // IMPORTANT: works for input + select + textarea
  const active =
    focused ||
    (value !== null && value !== undefined && value !== "");

  const baseInput =
    "w-full min-w-0 max-w-full box-border border rounded-sm bg-white text-black outline-none focus:ring-2 focus:ring-[var(--sage)] transition-all duration-200";

  return (
    <div className="relative w-full min-w-0 flex-1">

      {/* ICON */}
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      )}

      {/* LABEL */}
      <label
        className={`
          absolute bg-white px-1 pointer-events-none z-20
          transition-all duration-200 ease-in-out

          ${Icon ? "left-[40px]" : "left-3"}

          ${
            active
              ? "top-0 text-xs text-gray-500 -translate-y-1/2"
              : "top-1/2 -translate-y-1/2 text-base text-gray-400"
          }
        `}
      >
        {label}
      </label>

      {/* INPUT */}
      {type === "input" && (
        <input
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
          className={`
            ${baseInput}
            h-14 px-3 pt-5 pb-1
            ${Icon ? "pl-10" : "pl-3"}
          `}
          {...props}
        />
      )}

      {/* TEXTAREA */}
      {type === "textarea" && (
        <textarea
          rows={rows}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
          className={`
            ${baseInput}
            w-full min-h-[110px]
            px-3 pt-5 pb-2
            resize-none overflow-hidden
          `}
          {...props}
        />
      )}

        {/* SELECT (FIXED) */}
        {type === "select" && (
        <select
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={onChange}
            className={`
            ${baseInput}
            w-full min-w-0 max-w-full
            h-12
            px-3 pt-3 pb-1
            appearance-none
            `}
            {...props}
        >
            <option value=""></option>

            {options.map((option) => {
            const val = option.isoCode || option.value || option.name;
            const labelText = option.name || option.label;

            return (
                <option key={val} value={val}>
                {labelText}
                </option>
            );
            })}
        </select>
        )}
    </div>
  );
}