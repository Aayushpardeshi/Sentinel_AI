import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function Input({ className, label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>
      )}
      <input
        className={twMerge(clsx(
          'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500',
          className
        ))}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
