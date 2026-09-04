import axios from 'axios';

export async function performTokenRefresh(
  apiUrl: string,
  legacyRefreshToken?: string | null
): Promise<boolean> {
  try {
    await axios.post(
      `${apiUrl}/auth/refresh`,
      legacyRefreshToken ? { refreshToken: legacyRefreshToken } : undefined,
      { withCredentials: true }
    );
    return true;
  } catch {
    return false;
  }
}
