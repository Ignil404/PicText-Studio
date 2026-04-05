import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>DL2026 FSD2</h1>
      <p>Frontend application</p>
      <p>
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
      </p>
    </div>
  )
}

export default App