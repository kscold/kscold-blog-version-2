export interface VideoEmbedConfig {
  provider: 'youtube' | 'vimeo' | 'loom';
  embedUrl: string;
  canonicalUrl: string;
}

function normalizeYouTubeId(url: URL) {
  if (url.hostname === 'youtu.be') {
    return url.pathname.replace(/^\/+/, '').split('/')[0] || null;
  }

  if (url.hostname.endsWith('youtube.com')) {
    if (url.pathname === '/watch') {
      return url.searchParams.get('v');
    }

    if (url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/')[2] || null;
    }

    if (url.pathname.startsWith('/embed/')) {
      return url.pathname.split('/')[2] || null;
    }
  }

  return null;
}

function normalizeVimeoId(url: URL) {
  if (!url.hostname.endsWith('vimeo.com')) return null;
  const segments = url.pathname.split('/').filter(Boolean);
  const candidate = segments.find(segment => /^\d+$/.test(segment));
  return candidate ?? null;
}

function normalizeLoomId(url: URL) {
  if (!url.hostname.endsWith('loom.com')) return null;
  const match = url.pathname.match(/\/share\/([a-zA-Z0-9]+)/);
  return match?.[1] ?? null;
}

export function getVideoEmbedConfig(rawUrl: string): VideoEmbedConfig | null {
  try {
    const url = new URL(rawUrl);

    const youtubeId = normalizeYouTubeId(url);
    if (youtubeId) {
      return {
        provider: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
        canonicalUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      };
    }

    const vimeoId = normalizeVimeoId(url);
    if (vimeoId) {
      return {
        provider: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        canonicalUrl: `https://vimeo.com/${vimeoId}`,
      };
    }

    const loomId = normalizeLoomId(url);
    if (loomId) {
      return {
        provider: 'loom',
        embedUrl: `https://www.loom.com/embed/${loomId}`,
        canonicalUrl: `https://www.loom.com/share/${loomId}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}
