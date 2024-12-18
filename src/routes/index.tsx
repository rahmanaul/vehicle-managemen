import { createRootRoute, createRouter, createRoute, redirect } from '@tanstack/react-router'
import { Layout } from '../components/layout'
import { supabase } from '../lib/supabase'

// Import actual page components
import LoginPage from '../pages/login'
import DashboardPage from '../pages/dashboard'
import ASNPage from '../pages/asn'
import InstansiPage from '../pages/instansi'
import VehiclesPage from '../pages/vehicles'

// Auth check function
async function authCheck() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw redirect({
      to: '/login',
    })
  }
}

// Auth redirect function (for login page)
async function authRedirect() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    throw redirect({
      to: '/dashboard',
    })
  }
}

const rootRoute = createRootRoute({
  component: Layout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: authCheck,
  component: DashboardPage
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: authRedirect,
  component: LoginPage
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: authCheck,
  component: DashboardPage
})

const asnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/asn',
  beforeLoad: authCheck,
  component: ASNPage
})

const instansiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instansi',
  beforeLoad: authCheck,
  component: InstansiPage
})

const vehiclesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vehicles',
  beforeLoad: authCheck,
  component: VehiclesPage
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  asnRoute,
  instansiRoute,
  vehiclesRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
