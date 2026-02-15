'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    social: [
      { label: 'GitHub', href: 'https://github.com/kscold' },
      { label: 'LinkedIn', href: '#' },
      { label: 'Twitter', href: '#' },
    ],
    quick: [
      { label: 'Blog', href: '/blog' },
      { label: 'Portfolio', href: '/portfolio' },
      { label: 'About', href: '/about' },
      { label: 'Chat', href: '/chat' },
    ],
  };

  return (
    <footer className="relative mt-20 border-t border-accent-blue/10 bg-background-dark/40 backdrop-blur-md">
      {/* Footer Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-sans font-black tracking-[-0.05em] text-white">
                KSCOLD
              </span>
            </Link>
            <p className="mt-4 text-sm text-surface-400 font-light leading-relaxed max-w-sm text-balance">
              Building digital experiences while <span className="text-accent-light">Enjoying</span> the <span className="text-accent-blue">Learning Curve</span>.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-accent-light uppercase tracking-[0.2em] mb-6 opacity-70">
              Navigation
            </h4>
            <ul className="space-y-3">
              {links.quick.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-400 hover:text-white transition-colors hover:translate-x-1 inline-block duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-accent-light uppercase tracking-[0.2em] mb-6 opacity-70">
              Connect
            </h4>
            <ul className="space-y-3">
              {links.social.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    {link.label}
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-light opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-surface-600 font-mono tracking-wider">
            © {currentYear} KSCOLD. All rights reserved.
          </p>
          <div className="flex gap-6">
             <div className="w-2 h-2 rounded-full bg-surface-800 animate-pulse" />
             <div className="w-2 h-2 rounded-full bg-surface-800 animate-pulse animation-delay-200" />
             <div className="w-2 h-2 rounded-full bg-surface-800 animate-pulse animation-delay-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
