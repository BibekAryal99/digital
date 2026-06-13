"use client";

import { cn } from "@/lib/utils";

interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const inputId = id || props.name;
  return (
    <label
      htmlFor={inputId}
      className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700"
    >
      <input
        type="checkbox"
        id={inputId}
        className={cn(
          "h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-600/40",
          className
        )}
        {...props}
      />
      {label}
    </label>
  );
}
