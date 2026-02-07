'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'ref'> {
  variant?: 'default' | 'elevated' | 'glass';
  hover?: boolean;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-[20px] transition-all duration-300';

    const variantStyles = {
      default: 'bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-800 shadow-md',
      elevated: 'bg-white dark:bg-primary-900 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
      glass: 'glass-card',
    };

    const hoverStyles = hover ? 'anti-gravity cursor-pointer' : '';

    const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<'div'>>;

    return (
      <MotionDiv
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
        {...(hover && {
          whileHover: { y: -10 },
          transition: { type: 'spring', stiffness: 300, damping: 20 },
        })}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

Card.displayName = 'Card';

export default Card;
