import { Outlet } from 'react-router-dom'
import { DashboardProvider } from './DashboardContext'
import { ContextStrip } from './ContextStrip'

export function DashboardLayout() {
  return (
    <DashboardProvider>
      <ContextStrip />
      <Outlet />
    </DashboardProvider>
  )
}
