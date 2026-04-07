import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { EditorPage } from './pages/EditorPage'
import { HistoryPage } from './pages/HistoryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor/:id" element={<EditorPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  )
}

export default App
