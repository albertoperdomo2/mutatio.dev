'use client';

import { ReactNode, useEffect } from 'react';

// provider component that injects environment variables into the client without exposing them in the client bundle
// this allows us to use server-side environment variables for client-side encryption
export function EnvProvider({ children, encryptionKey }: { children: ReactNode, encryptionKey: string }) {
  useEffect(() => {
    // add the encryption key to the window object when the component mounts
    if (typeof window !== 'undefined') {
      (window as Window & typeof globalThis & { __ENCRYPTION_KEY?: string }).__ENCRYPTION_KEY = encryptionKey;
    }

    // cleanup function to remove the key when the component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as Window & typeof globalThis & { __ENCRYPTION_KEY?: string }).__ENCRYPTION_KEY;
      }
    };
  }, [encryptionKey]);

  return <>{children}</>;
}