'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamPrivate } from '../lib/useTeamPrivate';

export function PrivateDocsSection({ teamId }: { teamId: string }) {
  const { docs: privateDocs, unlocked: showPrivate, loading, error: pwError, unlock } = useTeamPrivate(teamId);
  const [password, setPassword] = useState('');

  const handleUnlock = () => unlock(password);

  return (
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
                onChange={e => setPassword(e.target.value)}
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
          <motion.div key="unlocked" className="p-5 space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {privateDocs.servers?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">서버</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {privateDocs.servers.map(srv => (
                    <div key={srv.label} className="p-3 bg-surface-900 rounded-xl text-xs font-mono">
                      <p className="text-surface-400 mb-1"># {srv.label}</p>
                      <p className="text-green-400 select-all">{srv.command}</p>
                      <p className="text-surface-500">pw: <span className="text-amber-400 select-all">{srv.password}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {privateDocs.sharedAccounts?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">공유 계정</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {privateDocs.sharedAccounts.map(acc => (
                    <div key={acc.label} className="p-3 bg-surface-900 rounded-xl text-xs font-mono">
                      <p className="text-surface-400 mb-1"># {acc.label}</p>
                      {acc.url && <a href={acc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block">{acc.url}</a>}
                      <p className="text-green-400 select-all">{acc.email}</p>
                      <p className="text-surface-500">pw: <span className="text-amber-400 select-all">{acc.password}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(privateDocs.envConfigs?.length ?? 0) > 0 && (
              <div>
                <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">.env / 설정</h3>
                <div className="space-y-2">
                  {privateDocs.envConfigs?.map(env => (
                    <div key={env.label} className="p-3 bg-surface-900 rounded-xl text-xs font-mono">
                      <p className="text-surface-400 mb-1"># {env.label}</p>
                      <pre className="text-green-400 whitespace-pre-wrap select-all">{env.content}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
  );
}
