import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import App from './App';
import './styles/globals.css';

function Root() {
  const initSocket = useAuthStore(s => s.initSocket);
  initSocket();
  return (
    <>
      <App />
      <Toaster
        position="top-right"
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
