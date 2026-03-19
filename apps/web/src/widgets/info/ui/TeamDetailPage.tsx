'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { TEAM_MEMBERS, BUSINESS_INFO, type TeamMember, type PrivateDocs } from '@/entities/profile/model/teamData';
import { apiClient } from '@/shared/api/api-client';

const DEPT_STYLES: Record<TeamMember['department'], { bg: string; text: string; label: string; border: string; accent: string; avatarBg: string }> = {
  product: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Product', border: 'border-amber-400', accent: '#d97706', avatarBg: '#92400e' },
  engineering: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Engineering', border: 'border-blue-400', accent: '#60a5fa', avatarBg: '#1e3a5f' },
  design: { bg: 'bg-pink-50', text: 'text-pink-700', label: 'Design', border: 'border-pink-400', accent: '#f472b6', avatarBg: '#831843' },
};

export function TeamDetailPage({ teamId }: { teamId: string }) {
  const [showPrivate, setShowPrivate] = useState(false);
  const [privateDocs, setPrivateDocs] = useState<PrivateDocs | null>(null);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!password.trim() || loading) return;
    setLoading(true);
    setPwError(false);
    try {
      const res = await apiClient.post<PrivateDocs>('/team/private', { password, teamId });
      setPrivateDocs(res);
      setShowPrivate(true);
    } catch {
      setPwError(true);
    } finally {
      setLoading(false);
    }
  };

  const leader = TEAM_MEMBERS[0];
  const others = TEAM_MEMBERS.slice(1);

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 상단 네비 */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/info" className="text-surface-400 hover:text-surface-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-md"
            style={{ background: '#6B5744' }}
          >
            <span className="text-lg">🐾</span>
            <span className="font-black text-base tracking-tight" style={{ color: '#A8C8E8' }}>pawpong</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-surface-900">Pawpong Team</h1>
            <p className="text-xs text-surface-400">반려동물 플랫폼 · 6명</p>
          </div>
          <a
            href="https://pawpong.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-surface-400 hover:text-surface-700 transition-colors underline"
          >
            pawpong.kr →
          </a>
        </div>

        {/* 조직도 */}
        <motion.div
          className="mb-8 p-6 bg-white border border-surface-200 rounded-2xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Organization</h2>
          <OrgChart />
        </motion.div>

        {/* 리더 카드 */}
        <motion.div
          className="p-6 bg-gradient-to-br from-surface-900 to-surface-800 text-white rounded-2xl mb-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-400" style={{ background: 'linear-gradient(135deg, #1e3a5f 50%, #92400e 50%)' }}>
              <span className="text-lg font-black">{leader.name.slice(1)}</span>
            </div>
            <div className="flex-1">
              <p className="font-black text-xl">{leader.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Tech Lead</span>
                <span className="text-white/30">·</span>
                <span className="text-white/50 text-sm">{leader.position}</span>
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm mb-4">{leader.role}</p>
          <p className="text-white/40 text-xs mb-3">{leader.scope}</p>
          <div className="flex flex-wrap gap-2">
            {leader.skills.map(s => (
              <span key={s} className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-medium">{s}</span>
            ))}
          </div>
        </motion.div>

        {/* 팀원 카드 — 리더와 동일 사이즈 */}
        <div className="space-y-4 mb-8">
          {others.map((member, i) => {
            const dept = DEPT_STYLES[member.department];
            return (
              <motion.div
                key={member.name}
                className="p-6 bg-gradient-to-br from-surface-900 to-surface-800 text-white rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2"
                    style={{
                      background: member.name === '김희영'
                        ? 'linear-gradient(135deg, #1e3a5f 50%, #831843 50%)'
                        : member.name === '류태호'
                        ? 'linear-gradient(135deg, #92400e 50%, #1e3a5f 50%)'
                        : dept.avatarBg,
                      borderColor: member.name === '김희영' ? '#a855f7' : member.name === '류태호' ? '#a855f7' : undefined,
                    }}
                  >
                    <span className="text-xl font-black">{member.name.slice(1)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-xl">{member.name}</p>
                    <div className="flex items-center gap-2">
                      {member.name === '류태호' ? (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#d97706' }}>Product</span>
                          <span className="text-white/30">·</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#60a5fa' }}>Engineering</span>
                        </>
                      ) : member.name === '김희영' ? (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#60a5fa' }}>Engineering</span>
                          <span className="text-white/30">·</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#f472b6' }}>Design</span>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dept.accent }}>{dept.label}</span>
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
          })}
        </div>

        {/* 사업자 정보 */}
        <motion.div
          className="p-5 bg-white border border-surface-200 rounded-2xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Business Info</h2>
          <div className="text-sm text-surface-600 space-y-1">
            <p><span className="font-bold text-surface-800">{BUSINESS_INFO.companyName}</span> · 대표 {BUSINESS_INFO.representative}</p>
            <p>사업자등록번호: {BUSINESS_INFO.registrationNumber}</p>
            <p className="text-xs text-surface-400">{BUSINESS_INFO.address}</p>
            <p className="text-xs text-surface-400">{BUSINESS_INFO.email}</p>
          </div>
        </motion.div>

        {/* 팀 내부 문서 (비밀번호 잠금) */}
        <motion.div
          className="border border-surface-200 rounded-2xl overflow-hidden bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="px-5 py-4 bg-surface-50 border-b border-surface-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-sm font-bold text-surface-700">팀 내부 문서</span>
            <span className="text-[10px] text-surface-400 ml-1">서버 · 계정 · .env · 주의사항</span>
          </div>

          <AnimatePresence mode="wait">
            {!showPrivate ? (
              <motion.div key="locked" className="p-5 space-y-3" exit={{ opacity: 0 }}>
                <p className="text-xs text-surface-400">팀원만 열람할 수 있습니다. 비밀번호를 입력해주세요.</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPwError(false); }}
                    onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                    placeholder="비밀번호"
                    className={`flex-1 px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-surface-300 ${pwError ? 'border-red-400 bg-red-50' : 'border-surface-200'}`}
                  />
                  <button
                    onClick={handleUnlock}
                    disabled={loading}
                    className="px-5 py-2.5 bg-surface-900 text-white text-sm font-bold rounded-xl hover:bg-surface-800 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '확인 중...' : '열람하기'}
                  </button>
                </div>
                {pwError && <p className="text-xs text-red-500">비밀번호가 틀렸습니다</p>}
              </motion.div>
            ) : privateDocs && (
              <motion.div
                key="unlocked"
                className="p-5 space-y-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* 서버 정보 */}
                {privateDocs.servers?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">서버</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {privateDocs.servers.map((srv) => (
                        <div key={srv.label} className="p-3 bg-surface-900 rounded-xl text-xs font-mono">
                          <p className="text-surface-400 mb-1"># {srv.label}</p>
                          <p className="text-green-400 select-all">{srv.command}</p>
                          <p className="text-surface-500">pw: <span className="text-amber-400 select-all">{srv.password}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 공유 계정 */}
                {privateDocs.sharedAccounts?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">공유 계정</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {privateDocs.sharedAccounts.map((acc) => (
                        <div key={acc.label} className="p-3 bg-surface-900 rounded-xl text-xs font-mono">
                          <p className="text-surface-400 mb-1"># {acc.label}</p>
                          {acc.url && (
                            <a href={acc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block">{acc.url}</a>
                          )}
                          <p className="text-green-400 select-all">{acc.email}</p>
                          <p className="text-surface-500">pw: <span className="text-amber-400 select-all">{acc.password}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* .env 설정 */}
                {(privateDocs.envConfigs?.length ?? 0) > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">.env / 설정</h3>
                    <div className="space-y-2">
                      {privateDocs.envConfigs?.map((env) => (
                        <div key={env.label} className="p-3 bg-surface-900 rounded-xl text-xs font-mono">
                          <p className="text-surface-400 mb-1"># {env.label}</p>
                          <pre className="text-green-400 whitespace-pre-wrap select-all">{env.content}</pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 주의사항 */}
                {privateDocs.notes?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">주의사항</h3>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
                      {privateDocs.notes.map((note, i) => (
                        <p key={i} className="text-xs text-red-700 flex items-start gap-2">
                          <span className="text-red-400 font-bold">!</span>
                          {note}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────── Org Chart ─────────────── */

function OrgChart() {
  const nodeW = 110;
  const nodeH = 42;
  const gapX = 20;

  // Row 2: 5 people
  const row2Count = 5;
  const totalRow2W = row2Count * nodeW + (row2Count - 1) * gapX;
  const startX = (totalRow2W - nodeW) / 2; // center CEO

  // Row 1: 3 departments centered under CEO
  const deptGap = 40;
  const deptTotalW = 3 * nodeW + 2 * deptGap;
  const deptStartX = (totalRow2W - deptTotalW) / 2;

  const nodes = [
    { id: 'ceo', x: startX, y: 10, label: '승찬', sub: 'CTO', color: '#1e293b' },
    { id: 'product', x: deptStartX, y: 90, label: 'Product', sub: '', color: '#d97706' },
    { id: 'engineering', x: deptStartX + nodeW + deptGap, y: 90, label: 'Engineering', sub: '', color: '#2563eb' },
    { id: 'design', x: deptStartX + 2 * (nodeW + deptGap), y: 90, label: 'Design', sub: '', color: '#db2777' },
    { id: 'pm', x: 0, y: 170, label: '용찬', sub: 'PM', color: '#d97706' },
    { id: 'se', x: nodeW + gapX, y: 170, label: '태호', sub: 'Tech Lead', color: '#7c3aed' },
    { id: 'pe', x: 2 * (nodeW + gapX), y: 170, label: '가원', sub: 'Platform', color: '#2563eb' },
    { id: 'fe', x: 3 * (nodeW + gapX), y: 170, label: '희영', sub: 'Frontend', color: '#7c3aed' },
    { id: 'ds', x: 4 * (nodeW + gapX), y: 170, label: '은진', sub: 'Designer', color: '#db2777' },
  ];

  const edges: [string, string][] = [
    ['ceo', 'product'], ['ceo', 'engineering'], ['ceo', 'design'],
    ['product', 'pm'], ['engineering', 'pm'],
    ['product', 'se'], ['engineering', 'se'],
    ['engineering', 'pe'],
    ['engineering', 'fe'], ['design', 'fe'],
    ['design', 'ds'],
  ];

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const svgW = totalRow2W + 20;

  return (
    <svg viewBox={`-10 0 ${svgW} 225`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {edges.map(([from, to]) => {
        const a = nodeMap[from];
        const b = nodeMap[to];
        const x1 = a.x + nodeW / 2;
        const y1 = a.y + nodeH;
        const x2 = b.x + nodeW / 2;
        const y2 = b.y;
        const midY = (y1 + y2) / 2;
        return (
          <path
            key={`${from}-${to}`}
            d={`M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={1.5}
          />
        );
      })}
      {nodes.map(n => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={nodeW} height={nodeH} rx={10} fill={n.color} />
          <text x={n.x + nodeW / 2} y={n.y + (n.sub ? 17 : 25)} textAnchor="middle" fill="white" fontSize={11} fontWeight={700} fontFamily="Pretendard, sans-serif">
            {n.label}
          </text>
          {n.sub && (
            <text x={n.x + nodeW / 2} y={n.y + 32} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={9} fontFamily="Pretendard, sans-serif">
              {n.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
