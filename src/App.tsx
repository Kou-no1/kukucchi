import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'
import { SpaceBackgroundEffects } from './components/common/SpaceBackgroundEffects'
import { SaveDataProvider } from './hooks/useSaveData'

export default function App() {
  return (
    <HashRouter>
      <SaveDataProvider>
        <SpaceBackgroundEffects />
        <AppRoutes />
      </SaveDataProvider>
    </HashRouter>
  )
}
