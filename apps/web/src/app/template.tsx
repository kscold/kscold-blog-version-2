'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        duration: 1, 
        ease: [0.76, 0, 0.24, 1] // Premium aesthetic ease curve
      }}
    >
      {children}
    </motion.div>
  );
}
