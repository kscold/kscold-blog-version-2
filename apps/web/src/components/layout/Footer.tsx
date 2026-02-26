'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    social: [
      { label: 'GitHub', href: 'https://github.com/kscold' },
      { label: 'LinkedIn', href: '#' },
      { label: 'Email', href: 'mailto:contact@coldcraft.dev' },
    ],
    quick: [{ label: 'Blog', href: '/blog' }],
  };

  return (
    <footer className="relative mt-20 bg-white border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/logo.svg"
                alt="KSCOLD Logo"
                className="w-7 h-7 group-hover:scale-110 transition-transform duration-500 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 will-change-transform"
              />
              <span className="text-2xl font-sans font-black tracking-[-0.05em] text-neutral-900 group-hover:text-neutral-600 transition-colors">
                KSCOLD
              </span>
            </Link>
            <p className="mt-1 text-xs font-mono text-neutral-400 tracking-wider uppercase">
              by KSCOLD
            </p>
            <p className="mt-4 text-sm text-neutral-500 font-light leading-relaxed max-w-sm text-balance">
              Crafting digital products with precision.
              <br />
              <span className="text-neutral-700 font-medium">Enjoying the Learning Curve.</span>
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {links.quick.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-6">
              Connect
            </h4>
            <ul className="space-y-3">
              {links.social.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400 font-mono tracking-wider">
            &copy; {currentYear} COLDING. All rights reserved.
          </p>
          <p className="text-[10px] text-neutral-300 font-mono tracking-widest uppercase">
            Seoul, South Korea
          </p>
        </div>
      </div>
    </footer>
  );
}
