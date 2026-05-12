import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { isSocketConnected, reconnectSocket } from '@/lib/socket';
import App from './App';
import './styles/globals.css';

// Reconectar socket ao recuperar conexão de rede ou voltar do background
window.addEventListener('online', () => {
  const token = useAuthStore.getState().accessToken;
  if (token && !isSocketConnected()) reconnectSocket(token);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const token = useAuthStore.getState().accessToken;
    if (token && !isSocketConnected()) reconnectSocket(token);
  }
});

function Root() {
  const initSocket = useAuthStore(s => s.initSocket);
  const refreshUser = useAuthStore(s => s.refreshUser);
  useEffect(() => {
    initSocket();
    refreshUser();
  }, []);
  return (
    <>
      <App />
      <Toaster
        position="top-right"
        closeButton
        toastOptions={{
          style: {
            background: 'var(--color-panel)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          },
        }}
      />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Root />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
