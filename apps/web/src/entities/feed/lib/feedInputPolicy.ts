export const FEED_INPUT_LIMITS = {
  contentLength: 10_000,
  imageCount: 4,
  linkUrlLength: 2_048,
} as const;

interface FeedSubmissionInput {
  content: string;
  imageCount: number;
  linkUrl: string;
}

export function normalizeFeedLinkUrl(linkUrl: string): string {
  return linkUrl.trim();
}

function normalizeHostname(hostname: string): string {
  const normalizedHostname = hostname.toLowerCase();
  return normalizedHostname.endsWith('.') ? normalizedHostname.slice(0, -1) : normalizedHostname;
}

function isSpecialUseHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'home.arpa' ||
    hostname.endsWith('.home.arpa')
  );
}

function isPublicIpv4Literal(hostname: string): boolean {
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some(octet => !Number.isInteger(octet))) {
    return true;
  }

  const [first, second, third] = octets;
  return (
    first !== 0 &&
    first !== 10 &&
    first !== 127 &&
    !(first === 100 && second >= 64 && second <= 127) &&
    !(first === 169 && second === 254) &&
    !(first === 172 && second >= 16 && second <= 31) &&
    !(first === 192 && second === 0 && third === 0) &&
    !(first === 192 && second === 0 && third === 2) &&
    !(first === 192 && second === 88 && third === 99) &&
    !(first === 192 && second === 168) &&
    !(first === 198 && (second === 18 || second === 19)) &&
    !(first === 198 && second === 51 && third === 100) &&
    !(first === 203 && second === 0 && third === 113) &&
    first < 224
  );
}

function isPublicIpv6Literal(hostname: string): boolean {
  if (!hostname.startsWith('[') || !hostname.endsWith(']')) {
    return true;
  }
  const address = hostname.slice(1, -1).toLowerCase();
  const firstHextet = Number.parseInt(address.split(':')[0], 16);
  return (
    firstHextet >= 0x2000 &&
    firstHextet <= 0x3fff &&
    !address.startsWith('2001:db8:') &&
    address !== '2001:db8::'
  );
}

export function isAbsoluteHttpUrl(linkUrl: string): boolean {
  const normalizedUrl = normalizeFeedLinkUrl(linkUrl);
  if (!normalizedUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(normalizedUrl);
    const hostname = normalizeHostname(parsedUrl.hostname);
    const isHttp = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    const hasAllowedPort = !parsedUrl.port || parsedUrl.port === '80' || parsedUrl.port === '443';
    return Boolean(
      isHttp &&
        hostname &&
        !parsedUrl.username &&
        !parsedUrl.password &&
        hasAllowedPort &&
        !isSpecialUseHostname(hostname) &&
        isPublicIpv4Literal(hostname) &&
        isPublicIpv6Literal(hostname)
    );
  } catch {
    return false;
  }
}

export function getFeedContentError(content: string): string | null {
  if (content.length <= FEED_INPUT_LIMITS.contentLength) {
    return null;
  }
  return `본문은 최대 ${FEED_INPUT_LIMITS.contentLength.toLocaleString('ko-KR')}자까지 입력할 수 있습니다.`;
}

export function getFeedLinkUrlError(linkUrl: string): string | null {
  const normalizedUrl = normalizeFeedLinkUrl(linkUrl);
  if (!normalizedUrl) {
    return null;
  }
  if (normalizedUrl.length > FEED_INPUT_LIMITS.linkUrlLength) {
    return `링크는 최대 ${FEED_INPUT_LIMITS.linkUrlLength.toLocaleString('ko-KR')}자까지 입력할 수 있습니다.`;
  }
  if (!isAbsoluteHttpUrl(normalizedUrl)) {
    return '공개 인터넷의 http 또는 https 전체 링크를 입력해주세요.';
  }
  return null;
}

export function getFeedImageCountError(
  currentImageCount: number,
  addedImageCount: number = 0
): string | null {
  if (currentImageCount + addedImageCount <= FEED_INPUT_LIMITS.imageCount) {
    return null;
  }
  return `이미지는 최대 ${FEED_INPUT_LIMITS.imageCount}장까지 첨부할 수 있습니다.`;
}

export function canSubmitFeed(input: FeedSubmissionInput): boolean {
  const hasPublishableContent = input.content.trim().length > 0 || input.imageCount > 0;
  return (
    hasPublishableContent &&
    !getFeedContentError(input.content) &&
    !getFeedImageCountError(input.imageCount) &&
    !getFeedLinkUrlError(input.linkUrl)
  );
}
