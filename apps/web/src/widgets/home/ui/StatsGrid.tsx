import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

interface Stat {
  label: string;
  value: number | null;
  suffix: string;
  description: string;
}

interface Props {
  stats: Stat[];
}

export function StatsGrid({ stats }: Props) {
  const { allowRichEffects } = usePerformanceMode();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="group rounded-2xl border border-surface-200 bg-surface-50 p-4 sm:p-6 transition-colors duration-300 hover:border-surface-300 hover:bg-white last:col-span-2 xl:last:col-span-1"
          initial={allowRichEffects ? { opacity: 0, y: 20 } : false}
          whileInView={allowRichEffects ? { opacity: 1, y: 0 } : undefined}
          viewport={allowRichEffects ? { once: true } : undefined}
          transition={allowRichEffects ? { duration: 0.5, delay: index * 0.08 } : undefined}
        >
          <p className="mb-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-surface-400">{stat.label}</p>
          <div className="my-1.5 sm:my-2 flex items-end gap-1">
            {stat.value !== null && stat.value > 0 ? (
              <>
                <span className="text-2xl sm:text-4xl font-black tabular-nums text-surface-900">{stat.value.toLocaleString()}</span>
                {stat.suffix && <span className="mb-0.5 sm:mb-1 text-sm sm:text-lg font-bold text-surface-400">{stat.suffix}</span>}
              </>
            ) : (
              <span className="text-2xl sm:text-4xl font-black tabular-nums text-surface-300">—</span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-surface-400">{stat.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
