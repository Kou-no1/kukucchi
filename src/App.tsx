import { HashRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'
import { SpaceBackgroundEffects } from './components/common/SpaceBackgroundEffects'
import { DailyUsageProvider } from './hooks/useDailyUsage'
import { SaveDataProvider } from './hooks/useSaveData'

export default function App() {
  return (
    <HashRouter>
      <SaveDataProvider>
        <DailyUsageProvider>
          <SpaceBackgroundEffects />
          <AppRoutes />
        </DailyUsageProvider>
      </SaveDataProvider>
    </HashRouter>
  )
}
