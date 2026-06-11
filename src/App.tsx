import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'
import { SaveDataProvider } from './hooks/useSaveData'

export default function App() {
  return (
    <HashRouter>
      <SaveDataProvider>
        <AppRoutes />
      </SaveDataProvider>
    </HashRouter>
  )
}
