'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'bank';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, variant = 'default', className = '', ...props }, ref) => {
    const inputStyles =
      variant === 'bank'
        ? 'input-bank'
        : `
            w-full px-5 py-3 rounded-[8px]
            bg-white border border-surface-200
            text-surface-900 placeholder:text-surface-400
            shadow-sm
            focus:outline-none focus:ring-1 focus:ring-surface-900 focus:border-surface-900 focus:shadow-[0_4px_12px_rgba(15,23,42,0.08)]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-surface-900 tracking-tight">
            {label}
          </label>
        )}
        <input ref={ref} className={`${inputStyles} ${className}`} {...props} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {helperText && !error && <p className="text-sm text-surface-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
