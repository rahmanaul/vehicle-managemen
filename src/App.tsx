import { RouterProvider } from '@tanstack/react-router'
import { router } from './routes'
import { AuthProvider } from './contexts/auth-context'

function App() {

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
