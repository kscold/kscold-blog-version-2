'use client';

interface Props {
  techStack?: string[];
}

export function ProfileTechStack({ techStack }: Props) {
  if (!techStack || techStack.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-surface-100">
      <p className="text-xs text-surface-400 mb-2 font-medium uppercase tracking-wide">기술 스택</p>
      <div className="flex flex-wrap gap-1.5">
        {techStack.map(tech => (
          <span
            key={tech}
            className="px-2.5 py-1 bg-surface-900 text-white text-xs font-medium rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
