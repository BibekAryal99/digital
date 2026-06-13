"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className, id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2",
          error
            ? "border-red-400 focus:ring-red-400"
            : "border-slate-300 focus:border-navy-600 focus:ring-navy-600/30",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export function optionsFromEnum(values: readonly string[]): Option[] {
  return values.map((v) => ({
    value: v,
    label: v
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));
}
