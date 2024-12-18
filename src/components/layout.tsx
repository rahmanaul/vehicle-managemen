import { Link, useRouter, Outlet } from '@tanstack/react-router'
import { Button } from './ui/button'
import { useAuth } from '../contexts/auth-context'

export function Layout() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.navigate({ to: '/login' })
  }

  // If we're on the login page, only render the outlet
  if (window.location.pathname === '/login') {
    return <Outlet />
  }

  // For authenticated pages, render the full layout
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-8">
            <Link to="/" className="text-xl font-bold">
              Vehicle Management
            </Link>
          </div>
          {user && (
            <>
              <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link to="/asn">
                  <Button variant="ghost">ASN</Button>
                </Link>
                <Link to="/instansi">
                  <Button variant="ghost">Instansi</Button>
                </Link>
                <Link to="/vehicles">
                  <Button variant="ghost">Vehicles</Button>
                </Link>
              </nav>
              <div className="ml-auto flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  )
}
