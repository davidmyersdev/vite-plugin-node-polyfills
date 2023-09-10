import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='App'>
      <h1>Example (React)</h1>
      <p>The following app includes React Query DevTools (see below) to assert that this plugin does not conflict with it.</p>
      <p>Here is a dynamic counter to test that React works as expected.</p>
      <p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </p>
      <p>
        The following text is encoded and decoded with Buffer: {Buffer.from('Hello!').toString()}
      </p>
    </div>
  )
}

export const app = () => {
  ReactDOM.createRoot(document.getElementById('react-app') as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </React.StrictMode>
  )
}
