import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PrintLabelsPage from './components/PrintLabelsPage.tsx'

async function loadApp() {
  if (window.location.pathname !== '/labels') {
    await import('./index.css')
    const { default: App } = await import('./App.tsx')
    return <App />
  }
  return <PrintLabelsPage />
}

loadApp().then((root) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {root}
    </StrictMode>,
  )
})
