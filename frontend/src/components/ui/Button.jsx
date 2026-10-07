import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const variants = {
  primary:   'bg-primary text-[#000] hover:bg-primary-hover font-semibold',
  secondary: 'bg-surfaceHover text-white hover:bg-[#2a2a2a]',
  outline:   'border border-border text-white hover:bg-surfaceHover',
  ghost:     'text-text-muted hover:text-white hover:bg-surfaceHover',
  danger:    'bg-red-500/10 text-red-500 hover:bg-red-500/20',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2 text-sm',
  lg: 'h-12 px-8 text-base',
};

export function Button({ className, variant = 'primary', size = 'md', isLoading, children, ...props }) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={twMerge(clsx(
        'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      ))}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
