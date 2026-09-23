const LINE = 'h-1.5 rounded-full bg-surface-600';

/** 기능을 설명하는 축약된 화면 표현이며 실제 대화·활동 수치를 만들지 않는다. */
export function FeatureIllustration({ index }: { index: number }) {
  return <div aria-hidden="true" className="mb-8 flex h-36 items-center justify-center overflow-hidden rounded-xl border border-surface-700 bg-surface-950/60 p-5">
    {index === 0 && <div className="w-full space-y-3"><div className="mb-5 font-mono text-xs text-primary-300">/ engineering-journal</div><div className={`${LINE} w-4/5`} /><div className={`${LINE} w-full`} /><div className={`${LINE} w-3/5`} /><div className="pt-2 text-xs text-surface-400">AI Agent · Backend · Web</div></div>}
    {index === 1 && <div className="w-full space-y-3"><div className="flex items-center gap-3"><span className="rounded-full bg-surface-700 px-3 py-2 text-xs">K</span><span className="text-xs text-surface-400">kscold · Feed</span></div><div className="rounded-lg bg-surface-800 p-3 text-sm text-surface-200">오늘 발견한 생각 한 조각.</div></div>}
    {index === 2 && <svg className="h-full w-full text-primary-300" viewBox="0 0 240 110"><path d="M40 55L110 20L180 50L110 90L40 55L180 50L210 95M110 20L110 90" fill="none" stroke="currentColor" opacity=".4" />{[[40,55],[110,20],[180,50],[110,90],[210,95]].map(([x,y]) => <circle key={x+y} cx={x} cy={y} r="5" fill="currentColor" />)}<text x="15" y="105" fill="currentColor" fontSize="9">CONNECTED NOTES</text></svg>}
    {index === 3 && <div className="w-full space-y-3 text-xs"><div className="ml-6 rounded-xl border border-surface-600 px-3 py-2 text-surface-200">어디서부터 읽어볼까요?</div><div className="flex gap-3 text-primary-300"><span>+</span><span className="tracking-widest">함께 탐색하는 AI Agent</span></div><div className="h-px bg-surface-700" /></div>}
    {index === 4 && <div className="text-center"><div className="font-mono text-xs tracking-widest text-primary-300">LEARN / BUILD / TOGETHER</div><div className="mt-6 flex justify-center -space-x-2">{['AI','DEV','YOU'].map(label => <span key={label} className="flex h-12 w-12 items-center justify-center rounded-full border border-surface-500 bg-surface-800 text-xs text-surface-200">{label}</span>)}</div></div>}
  </div>;
}
