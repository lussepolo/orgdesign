import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import PasswordGate from './PasswordGate.tsx';
import { LocaleProvider } from './i18n/LocaleProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <PasswordGate>
        <App />
      </PasswordGate>
    </LocaleProvider>
  </StrictMode>,
);
