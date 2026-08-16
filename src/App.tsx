import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { DashboardLayout } from './components/dashboard/DashboardLayout'
import { Home } from './pages/Home'
import { TextChecker } from './pages/TextChecker'
import { LinkChecker } from './pages/LinkChecker'
import { CallShield } from './pages/CallShield'
import { RecordedCall } from './pages/RecordedCall'
import { Trends } from './pages/Trends'
import { Report } from './pages/Report'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-base">
        <Navbar />
        <main className="flex-1 pt-24 sm:pt-28">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route element={<DashboardLayout />}>
              <Route path="/text-checker" element={<TextChecker />} />
              <Route path="/link-checker" element={<LinkChecker />} />
              <Route path="/call-shield" element={<CallShield />} />
              <Route path="/recorded-call" element={<RecordedCall />} />
            </Route>
            <Route path="/trends" element={<Trends />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
