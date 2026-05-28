'use client';

interface VideoPlayerProps {
  src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-[28px] border border-surface-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-surface-400">
            Video
          </p>
          <p className="mt-1 text-sm font-semibold text-surface-900">MP4</p>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-surface-500 underline decoration-surface-300 underline-offset-4 hover:text-surface-900 hover:decoration-surface-900"
        >
          새 탭에서 열기
        </a>
      </div>

      <video
        src={src}
        controls
        preload="metadata"
        playsInline
        className="block w-full bg-surface-950"
      />
    </figure>
  );
}
