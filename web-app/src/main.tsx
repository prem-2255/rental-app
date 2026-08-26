import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const _fetch = window.fetch;
window.fetch = (input, init: RequestInit = {}) => {
  const url = typeof input === 'string' ? input : (input as Request).url;
  if (url.startsWith('/api')) {
    const token = localStorage.getItem('token');
    init.headers = { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }
  return _fetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
