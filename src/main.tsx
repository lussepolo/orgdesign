import { lazy, StrictMode, Suspense } from 'react';
import {createRoot} from 'react-dom/client';
import { LocaleProvider } from './i18n/LocaleProvider';
import PasswordGate from './PasswordGate';

const App = lazy(() => import('./App.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <PasswordGate>
        <Suspense fallback={null}>
          <App />
        </Suspense>
      </PasswordGate>
    </LocaleProvider>
  </StrictMode>,
);
