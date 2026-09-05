'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'bank';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      className = '',
      id,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = error || helperText ? `${inputId}-message` : undefined;
    const descriptionIds = [ariaDescribedBy, messageId].filter(Boolean).join(' ') || undefined;
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
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-900 tracking-tight"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={descriptionIds}
          aria-invalid={ariaInvalid ?? (error ? true : undefined)}
          className={`${inputStyles} ${className}`}
          {...props}
        />
        {error && (
          <p id={messageId} role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={messageId} className="text-sm text-surface-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
