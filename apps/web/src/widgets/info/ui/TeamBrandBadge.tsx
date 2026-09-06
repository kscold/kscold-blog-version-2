import Image from 'next/image';
import type { TeamProfile } from '@/entities/profile';

interface TeamBrandBadgeProps {
  team: Pick<TeamProfile, 'name' | 'shortName' | 'badge'>;
  compact?: boolean;
}

export function TeamBrandBadge({ team, compact = false }: TeamBrandBadgeProps) {
  const isWordmark = team.badge.logoLayout === 'wordmark';

  return (
    <div
      className={`flex flex-shrink-0 items-center gap-2 rounded-full shadow-sm ${
        compact ? 'px-4 py-2' : 'px-5 py-2.5'
      }`}
      style={{ background: team.badge.backgroundColor }}
    >
      {team.badge.logoSrc ? (
        <Image
          src={team.badge.logoSrc}
          alt={`${team.name} 로고`}
          width={96}
          height={32}
          className={
            isWordmark
              ? `${compact ? 'h-5' : 'h-7'} w-auto`
              : `${compact ? 'h-5 w-5' : 'h-6 w-6'} rounded-full object-cover`
          }
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-full border border-white/20 font-black text-white/80 ${
            compact ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-xs'
          }`}
        >
          {team.badge.mark}
        </span>
      )}
      {!isWordmark && (
        <span
          className={`${compact ? 'text-sm' : 'text-base'} font-black tracking-tight`}
          style={{ color: team.badge.textColor }}
        >
          {team.shortName}
        </span>
      )}
    </div>
  );
}
