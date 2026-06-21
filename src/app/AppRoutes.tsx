import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AdvancedPage } from '../features/advanced/AdvancedPage'
import { BossBattlePage } from '../features/bosses/BossBattlePage'
import { MonsterBookPage } from '../features/book/MonsterBookPage'
import { CustomPage } from '../features/custom/CustomPage'
import { GameSelectPage } from '../features/games/GameSelectPage'
import { HomePage } from '../features/home/HomePage'
import { LearnPage } from '../features/learn/LearnPage'
import { MiniGamePage } from '../features/miniGames/MiniGamePage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { ReviewPage } from '../features/review/ReviewPage'
import { ResultPage } from '../features/results/ResultPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { ShopPage } from '../features/shop/ShopPage'
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
        path="/review"
        element={
          <RequireProfile>
            <ReviewPage />
          </RequireProfile>
        }
      />
      <Route
        path="/battle"
        element={
          <RequireProfile>
            <BossBattlePage group="basic" />
          </RequireProfile>
        }
      />
      <Route
        path="/boss/:bossId"
        element={
          <RequireProfile>
            <BossBattlePage />
          </RequireProfile>
        }
      />
      <Route
        path="/monster-battle"
        element={
          <RequireProfile>
            <MiniGamePage variant="battle" />
          </RequireProfile>
        }
      />
      <Route
        path="/treasure"
        element={
          <RequireProfile>
            <MiniGamePage variant="treasure" />
          </RequireProfile>
        }
      />
      <Route
        path="/rocket"
        element={
          <RequireProfile>
            <MiniGamePage variant="rocket" />
          </RequireProfile>
        }
      />
      <Route
        path="/advanced"
        element={
          <RequireProfile>
            <AdvancedPage />
          </RequireProfile>
        }
      />
      <Route
        path="/shop"
        element={
          <RequireProfile>
            <ShopPage />
          </RequireProfile>
        }
      />
      <Route
        path="/custom"
        element={
          <RequireProfile>
            <CustomPage />
          </RequireProfile>
        }
      />
      <Route
        path="/book"
        element={
          <RequireProfile>
            <MonsterBookPage />
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
