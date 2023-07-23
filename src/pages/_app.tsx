import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import DerivAPIContext from '@/context/DerivAPIContext';
import DerivAPI from '@/utils/API';
import { useEffect, useState } from 'react';

const Deriv = DerivAPI('wss://qa10.deriv.dev/websockets/v3?app_id=1006&l=EN&brand=deriv');

export default function App({ Component, pageProps }: AppProps) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    Deriv.on('open', () => setIsConnected(true));
  }, []);

  if (!isConnected) {
    return 'Not Connected';
  }

  return (
    <DerivAPIContext.Provider value={Deriv}>
      <Component {...pageProps} />
    </DerivAPIContext.Provider>
  );
}
