import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import { Layout } from './components/Layout'
import { CelebrationLayer } from './components/Celebration'
import { Dashboard } from './pages/Dashboard'
import { Contas } from './pages/Contas'
import { Futuro } from './pages/Futuro'
import { Reservas } from './pages/Reservas'
import { Conquistas } from './pages/Conquistas'
import { Viagens } from './pages/Viagens'
import { Ajustes } from './pages/Ajustes'

export default function App() {
  return (
    <AppStoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contas" element={<Contas />} />
            <Route path="/futuro" element={<Futuro />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/conquistas" element={<Conquistas />} />
            <Route path="/viagens" element={<Viagens />} />
            <Route path="/ajustes" element={<Ajustes />} />
          </Routes>
        </Layout>
        <CelebrationLayer />
      </HashRouter>
    </AppStoreProvider>
  )
}
