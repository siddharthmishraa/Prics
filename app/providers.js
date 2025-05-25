'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <ToastContainer position="bottom-right" theme="dark" />
    </SessionProvider>
  );
}
