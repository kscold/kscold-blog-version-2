'use client';

import { createContext, useContext } from 'react';

export const SessionIdentityContext = createContext('anonymous');

export function useSessionIdentity() {
  return useContext(SessionIdentityContext);
}
