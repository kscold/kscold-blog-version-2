'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'glass' | 'bank';
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, className = '', children, onClick }, ref) => {
    const baseStyles = 'rounded-[16px] transition-all duration-300';

    const variantStyles = {
      default:
        'bg-white dark:bg-surface-900 border border-primary-200 dark:border-white/10 shadow-md',
      elevated:
        'bg-white dark:bg-surface-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
      glass: 'glass-card',
      bank: 'bg-surface-900 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
    };

    const hoverStyles = hover ? 'anti-gravity cursor-pointer' : '';

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
        onClick={onClick}
        {...(hover && {
          whileHover: { y: -8, scale: 1.02 },
          transition: { type: 'spring', stiffness: 400, damping: 25 },
        })}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
