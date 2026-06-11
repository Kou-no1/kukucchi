import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { GameSelectPage } from '../features/games/GameSelectPage'
import { HomePage } from '../features/home/HomePage'
import { LearnPage } from '../features/learn/LearnPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { ResultPage } from '../features/results/ResultPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { SpeedPage } from '../features/speed/SpeedPage'
import { useSaveData } from '../hooks/useSaveData'

function RequireProfile({ children }: { children: ReactNode }) {
  const { saveData } = useSaveData()
  if (!saveData.player) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

export function AppRoutes() {
  const { saveData } = useSaveData()

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={saveData.player ? '/home' : '/onboarding'} replace />}
      />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/home"
        element={
          <RequireProfile>
            <HomePage />
          </RequireProfile>
        }
      />
      <Route
        path="/games"
        element={
          <RequireProfile>
            <GameSelectPage />
          </RequireProfile>
        }
      />
      <Route
        path="/learn"
        element={
          <RequireProfile>
            <LearnPage />
          </RequireProfile>
        }
      />
      <Route
        path="/speed"
        element={
          <RequireProfile>
            <SpeedPage />
          </RequireProfile>
        }
      />
      <Route
        path="/result"
        element={
          <RequireProfile>
            <ResultPage />
          </RequireProfile>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireProfile>
            <SettingsPage />
          </RequireProfile>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
