'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PROFILE, SKILL_CATEGORIES } from '@/entities/profile/model/profileData';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Profile Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-28 h-28 bg-surface-900 rounded-full mx-auto mb-6 flex items-center justify-center ring-4 ring-surface-200">
            <span className="text-3xl font-black text-white tracking-tight">
              {PROFILE.handle.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tight text-surface-900 mb-2">
            {PROFILE.name}
          </h1>
          <p className="text-sm font-mono text-surface-400 mb-3">@{PROFILE.handle}</p>
          <p className="text-lg text-surface-500 font-medium">{PROFILE.title}</p>
        </motion.div>

        {/* About */}
        <motion.section
          className="mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">
            About
          </h2>
          <div className="space-y-4">
            {PROFILE.bio.map((paragraph, i) => (
              <p key={i} className="text-surface-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section
          className="mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">
            Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SKILL_CATEGORIES.map(category => (
              <div
                key={category.label}
                className="p-5 bg-white border border-surface-200 rounded-xl"
              >
                <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider mb-3">
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs font-medium text-surface-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          className="mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">
            Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={PROFILE.contacts.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white border border-surface-200 rounded-xl hover:border-surface-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-surface-900 group-hover:text-surface-600 transition-colors">
                  GitHub
                </p>
                <p className="text-xs text-surface-500 truncate">github.com/kscold</p>
              </div>
            </a>

            <a
              href={`mailto:${PROFILE.contacts.email}`}
              className="flex items-center gap-4 p-4 bg-white border border-surface-200 rounded-xl hover:border-surface-400 transition-colors group"
            >
              <div className="w-10 h-10 bg-surface-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-surface-900 group-hover:text-surface-600 transition-colors">
                  Email
                </p>
                <p className="text-xs text-surface-500 truncate">{PROFILE.contacts.email}</p>
              </div>
            </a>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            href="/blog"
            className="inline-block px-8 py-3 bg-surface-900 text-white rounded-xl font-bold hover:bg-surface-800 transition-colors text-sm"
          >
            블로그 둘러보기
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
