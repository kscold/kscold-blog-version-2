import axios from 'axios';
import { storeAccessToken, storeRefreshToken } from '@/shared/lib/authTokenStorage';

export async function performTokenRefresh(
  apiUrl: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const response = await axios.post(`${apiUrl}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    storeAccessToken(accessToken);

    if (newRefreshToken) {
      storeRefreshToken(newRefreshToken);
    }

    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}
