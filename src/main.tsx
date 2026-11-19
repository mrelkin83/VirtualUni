import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { ThemeProvider } from './theme'
import { ToastProvider } from './components/ui'
import './index.css'

// react-query estaba instalado pero sin proveedor: ningún componente podía
// usar useQuery/useMutation. La sección de gestión académica lo necesita.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* ThemeProvider lee el color del tenant del store, así que va por
          dentro de los proveedores de datos. */}
      <ThemeProvider>
        {/* ToastProvider envuelve la app entera: sirve los avisos y el diálogo
            de confirmación, y se registra en el emisor de módulo para que
            `avisar.*` y `confirmar()` funcionen también fuera de un
            componente. Sustituye a los diálogos nativos del navegador. */}
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
