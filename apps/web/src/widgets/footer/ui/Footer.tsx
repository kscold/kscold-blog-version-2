'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    social: [
      { label: 'GitHub', href: 'https://github.com/kscold' },
      { label: 'Email', href: 'mailto:contact@coldcraft.dev' },
    ],
    quick: [
      { label: 'Blog', href: '/blog' },
      { label: 'Feed', href: '/feed' },
      { label: 'Vault', href: '/vault' },
      { label: 'Info', href: '/info' },
    ],
  };

  return (
    <footer className="relative mt-20 bg-white border-t border-surface-200">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/logo.svg"
                alt="KSCOLD Logo"
                width={28}
                height={28}
                className="group-hover:scale-110 transition-transform duration-500 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 will-change-transform"
              />
              <span className="text-2xl font-sans font-black tracking-[-0.05em] text-surface-900 group-hover:text-surface-600 transition-colors">
                KSCOLD
              </span>
            </Link>
            <p className="mt-1 text-xs font-mono text-surface-400 tracking-wider uppercase">
              by Colding
            </p>
            <p className="mt-4 text-sm text-surface-500 font-light leading-relaxed max-w-sm text-balance">
              지식을 기록하고, 기록을 연결하고,
              <br />
              <span className="text-surface-700 font-medium">연결을 공유합니다.</span>
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs font-bold text-surface-400 uppercase tracking-[0.2em] mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {links.quick.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-500 hover:text-surface-900 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-mono text-xs font-bold text-surface-400 uppercase tracking-[0.2em] mb-6">
              Connect
            </h4>
            <ul className="space-y-3">
              {links.social.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-surface-500 hover:text-surface-900 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Business Info */}
        <div className="mt-12 pt-8 border-t border-surface-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-surface-400 leading-relaxed">
            <div className="space-y-1">
              <p><span className="text-surface-500 font-medium">상호</span> 콜딩(Colding)</p>
              <p><span className="text-surface-500 font-medium">대표</span> 김승찬</p>
              <p><span className="text-surface-500 font-medium">사업자등록번호</span> 457-49-00942</p>
            </div>
            <div className="space-y-1">
              <p><span className="text-surface-500 font-medium">주소</span> 경기도 김포시 김포한강9로75번길 66, 5층 (구래동, 국제프라자)</p>
              <p><span className="text-surface-500 font-medium">개발자</span> <a href="mailto:developerkscold@gmail.com" className="hover:text-surface-600 transition-colors">developerkscold@gmail.com</a></p>
              <p><span className="text-surface-500 font-medium">사업자</span> <a href="mailto:coldingcontact@gmail.com" className="hover:text-surface-600 transition-colors">coldingcontact@gmail.com</a></p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-surface-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-surface-400 font-mono tracking-wider">
            &copy; {currentYear} Colding. All rights reserved.
          </p>
          <p className="text-[10px] text-surface-300 font-mono tracking-widest uppercase">
            Gimpo, South Korea
          </p>
        </div>
      </div>
    </footer>
  );
}
