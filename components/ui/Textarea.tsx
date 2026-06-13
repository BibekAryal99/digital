"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxChars?: number;
  value?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, maxChars, className, id, value, ...props }, ref) {
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
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxChars}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-slate-300 focus:border-navy-600 focus:ring-navy-600/30",
            className
          )}
          rows={props.rows ?? 4}
          {...props}
        />
        <div className="mt-1 flex justify-between">
          {error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : (
            <span />
          )}
          {maxChars && (
            <span className="text-xs text-slate-400">
              {(value?.length ?? 0)}/{maxChars}
            </span>
          )}
        </div>
      </div>
    );
  }
);
