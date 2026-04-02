'use client';

import { createContext, useContext } from 'react';
import type { InitialViewer } from '@/shared/lib/initialViewer';
import { ANONYMOUS_VIEWER } from '@/shared/lib/initialViewer';

const ViewerContext = createContext<InitialViewer>(ANONYMOUS_VIEWER);

export function ViewerProvider({
  children,
  initialViewer,
}: {
  children: React.ReactNode;
  initialViewer: InitialViewer;
}) {
  return <ViewerContext.Provider value={initialViewer}>{children}</ViewerContext.Provider>;
}

export function useInitialViewer() {
  return useContext(ViewerContext);
}
