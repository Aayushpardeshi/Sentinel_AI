import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function Card({ className, children, ...props }) {
  return (
    <div className={twMerge('rounded-2xl border border-border/50 bg-surface/40 backdrop-blur-md shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return <div className={twMerge('px-6 py-4 border-b border-border', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={twMerge('font-semibold leading-none tracking-tight text-white', className)} {...props}>{children}</h3>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={clsx('p-6', className)} {...props}>{children}</div>;
}
