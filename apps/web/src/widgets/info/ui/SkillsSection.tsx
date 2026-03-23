'use client';

import { motion } from 'framer-motion';
import { SKILL_CATEGORIES } from '@/entities/profile/model/profileData';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function SkillsSection() {
  return (
    <motion.section
      className="mb-16"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">Skills</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SKILL_CATEGORIES.map(category => (
          <div key={category.label} className="p-5 bg-white border border-surface-200 rounded-xl">
            <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">
              {category.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs font-medium text-surface-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
