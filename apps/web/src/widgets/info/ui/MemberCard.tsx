import { motion } from 'framer-motion';
import type { TeamMember } from '@/entities/profile/model/teamData';

const DEPT_STYLES: Record<TeamMember['department'], { accent: string; avatarBg: string }> = {
  product: { accent: '#d97706', avatarBg: '#92400e' },
  engineering: { accent: '#60a5fa', avatarBg: '#1e3a5f' },
  design: { accent: '#f472b6', avatarBg: '#831843' },
};

const DUAL_DEPT: Record<string, { colors: [string, string]; accents: [string, string]; labels: [string, string] }> = {
  '김승찬': { colors: ['#1e3a5f', '#92400e'], accents: ['#60a5fa', '#d97706'], labels: ['Engineering', 'Product'] },
  '류태호': { colors: ['#92400e', '#1e3a5f'], accents: ['#d97706', '#60a5fa'], labels: ['Product', 'Engineering'] },
  '김희영': { colors: ['#1e3a5f', '#831843'], accents: ['#60a5fa', '#f472b6'], labels: ['Engineering', 'Design'] },
};

interface MemberCardProps {
  member: TeamMember;
  index: number;
  isLeader?: boolean;
}

export function MemberCard({ member, index, isLeader }: MemberCardProps) {
  const dept = DEPT_STYLES[member.department];
  const dual = DUAL_DEPT[member.name];
  const firstName = member.name.slice(1);

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-surface-900 to-surface-800 text-white rounded-2xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: isLeader ? 0.1 : 0.15 + index * 0.08 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2"
          style={{
            background: dual
              ? `linear-gradient(135deg, ${dual.colors[0]} 50%, ${dual.colors[1]} 50%)`
              : dept.avatarBg,
            borderColor: dual ? '#a855f7' : `${dept.accent}66`,
          }}
        >
          <span className={`font-black ${isLeader ? 'text-lg' : 'text-xl'}`}>{firstName}</span>
        </div>
        <div className="flex-1">
          <p className="font-black text-xl">{member.name}</p>
          <div className="flex items-center gap-2">
            {dual ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dual.accents[0] }}>{dual.labels[0]}</span>
                <span className="text-white/30">·</span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dual.accents[1] }}>{dual.labels[1]}</span>
              </>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dept.accent }}>
                {isLeader ? 'Tech Lead' : member.department.charAt(0).toUpperCase() + member.department.slice(1)}
              </span>
            )}
            <span className="text-white/30">·</span>
            <span className="text-white/50 text-sm">{member.position}</span>
          </div>
        </div>
      </div>
      <p className="text-white/60 text-sm mb-1">{member.role}</p>
      <p className="text-white/40 text-xs mb-4">{member.scope}</p>
      <div className="flex flex-wrap gap-2">
        {member.skills.map(s => (
          <span key={s} className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-medium">{s}</span>
        ))}
      </div>
    </motion.div>
  );
}
