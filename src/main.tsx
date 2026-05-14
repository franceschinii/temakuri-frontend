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
import './styles/themes.css';

// Reconectar socket ao recuperar conexão de rede ou voltar do background.
// refreshUser primeiro para garantir token válido antes de abrir o socket.
let reconnectScheduled = false;
function handleReconnect() {
  if (reconnectScheduled) return;
  reconnectScheduled = true;
  setTimeout(() => {
    reconnectScheduled = false;
    const store = useAuthStore.getState();
    if (!store.accessToken) return;
    store.refreshUser().then(() => {
      const token = useAuthStore.getState().accessToken;
      if (token && !isSocketConnected()) reconnectSocket(token);
    }).catch(() => {});
  }, 300);
}

window.addEventListener('online', handleReconnect);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') handleReconnect();
});

function Root() {
  const initSocket = useAuthStore(s => s.initSocket);
  const refreshUser = useAuthStore(s => s.refreshUser);
  useEffect(() => {
    // refreshUser primeiro: valida/renova o token antes de conectar o socket.
    // No mobile o token persisted pode ter expirado — o interceptor faz refresh
    // automático, e setAccessToken reconecta o socket com o token novo.
    // Só chamar initSocket se o refreshUser não reconectou já (token ainda válido).
    refreshUser().then(() => {
      initSocket();
    });
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
