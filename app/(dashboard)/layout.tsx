import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { AppNav } from '@/components/shared/AppNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppNav />
      {/* Offset : sidebar fixe 208px sur desktop, espace nav basse sur mobile */}
      <div className="lg:ml-56 pb-20 lg:pb-0">
        {children}
      </div>
    </ThemeProvider>
  )
}
