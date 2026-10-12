import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import { useApp } from './context/AppState'
import Auth from './pages/Auth'
import Chats from './pages/Chats'
import ErrorPage from './pages/ErrorPage'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Signals from './pages/Signals'
import Splash from './pages/Splash'
import Web from './pages/Web'

function RequireAuth({ children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Auth />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="chats" replace />} />
        <Route path="chats" element={<Chats />} />
        <Route path="web" element={<Web />} />
        <Route path="signals" element={<Signals />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}
