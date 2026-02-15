import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NuqsAdapter } from 'nuqs/adapters/react'
import './index.css'
import PrintLabelsPage from './components/pages/PrintLabelsPage.tsx'
import ManifestPage from './components/pages/ManifestPage.tsx'

async function loadApp() {
  const pathname = window.location.pathname

  if (pathname === '/labels') {
    return <PrintLabelsPage />
  }
  if (pathname === '/manifest') {
    return <ManifestPage />
  }

  const { default: App } = await import('./App.tsx')
  return <App />
}

loadApp().then((root) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <NuqsAdapter>
        {root}
      </NuqsAdapter>
    </StrictMode>,
  )
})
