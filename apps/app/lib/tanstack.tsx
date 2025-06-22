'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const OneHoureInMs = 60 * 60 * 1000;

const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
        retry: false,
        staleTime: OneHoureInMs,
        gcTime: Infinity,
      },
    },
  }
);

const TanstackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default TanstackProvider;