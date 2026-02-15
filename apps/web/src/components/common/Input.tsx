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
            bg-surface-900 border-none
            text-primary-100 placeholder:text-surface-400
            shadow-[0_4px_8px_rgba(0,0,0,0.2)]
            focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT/50 focus:shadow-[0_4px_12px_rgba(6,182,212,0.3)]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'ring-2 ring-red-500/50' : ''}
          `;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-primary-100 tracking-tight">
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
